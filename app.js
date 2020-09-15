const express = require('express')
const path = require('path');
const app = express();
const dayjs = require('dayjs')
const cookieParser = require('cookie-parser');
const sortAthlete = require("./sortAthlete")();
const allAthletes = require('./views/ID.json');
let rank = [];
require('dotenv').config();
let debug = process.env.DEBUG === 'true';
const getDate = () => {
    return new dayjs().format('YYYY-MM-DDTHH:mm:ss');
}

const snapshotVal = {
    ztqnipen: {completed: '[0,2,4,5,6,7,8]'},
    yvzvptje: {completed: '[12]'},
    wldjiuch: {completed: '[12,39]'},
    wsstjzzi: {completed: '[0]'},
    wwtpjnve: {completed: '[0,12,39,29,23,20]'},
    yskeljmu: {completed: '[12,2,3,6,5,8]'},
    ytijifwm: {completed: '[12,29,23]'},
    yygajupl: {completed: '[23]'},
    zwuvnwvo: {completed: '[0,1,2,4]'}
};

// Import Admin SDK
var firebase = require("firebase/app");
require("firebase/database");
const firebaseConfig = {
    apiKey: process.env.APIKEY,
    authDomain: process.env.AUTHDOMAIN,
    databaseURL: process.env.DATABASEURL,
    projectId: process.env.PROJECTID,
    storageBucket: process.env.STORAGEBUCKET,
    messagingSenderId: process.env.MESSAGINGSENDERID,
    appId: process.env.APPID,
    measurementId: process.env.MEASUREMENTID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(express.json());

//setup public folder
app.use(express.static('./public'));
app.get('', (req, res) => {
    res.render('index')
});

app.post('/login', (req, res) => {
    let uid = req.body.uid.toLowerCase()
    console.log(`${getDate()}: User ${uid} logged in`)
    if (allAthletes.includes(uid)) {
        res.cookie('userData', uid);
        res.render('problemsList', {
            uid: uid
        })
    } else {
        res.render('index');
    }
});
app.post('/markCompleted/:uid', (req, res) => {
    markCompletedBlocks(req.params.uid, req.body)
        .then(data => res.send(data));
});
app.get('/deleteCookies', (req, res) => {
    console.log(`${getDate()}: User logged`)
    res.cookie('userData', '');
    res.render('index');
});
app.get('/getCompleted/:uid', (req, res) => {
    getCompletedBlocks(req.params.uid)
        .then(data => res.send(data));
});
app.get('/classifica/:uid', (req, res) => {
    console.log(`${getDate()}: User ${req.params.uid} requested the ranking`)
    res.render('results', {
        uid: req.params.uid
    })
});
app.get('/mappa', (req, res) => {
    console.log(`${getDate()}: User accessed MAP`)
    res.render('map')
});
app.get('/getRanking', (req, res) => {
    res.send(rank);
});
let port = process.env.SERVER_PORT || 3000
app.listen(port, () => console.log(`${getDate()}: App Started on port ${port}!`));

function fetchData() {
    return new Promise(async (resolve, reject) => {
        if (debug) {
            console.log(`${getDate()}: Served in ### DEBUG MODE ###`)
            resolve(sortAthlete.orderObjByScore(snapshotVal));
        } else {
            console.log(`${getDate()}: Served in ### PROD MODE ###`)
            const athletesRef = db.ref('/athletes');
            athletesRef.orderByKey().on('value', snapshot => {
                resolve(sortAthlete.orderObjByScore(snapshot.val()))
            }, err => reject(`Error: ${err}`));
        }
    })
}

function getCompletedBlocks(uid) {
    console.log(`${getDate()}: User ${uid} requested his blocks`)
    return new Promise(async (resolve, reject) => {
        if (debug) {
            let tempArr = [];
            for (let i = 0; i<40; i++) {
                Math.random() < 0.1 && tempArr.push(i);
            }
            resolve(tempArr);
        }
        const athletesRef = db.ref('/athletes/').child(uid + '/completed');
        athletesRef.orderByKey().on('value', snapshot => {
            resolve(JSON.parse(snapshot.val()) || [])
        }, err => reject(`${getDate()} Error: ${err}`));
    })
}

function markCompletedBlocks(uid, body) {
    console.log(`${getDate()}: User ${uid} marked some block`)
    if (debug) {
        return {}
    }
    return new Promise((resolve, reject) => {
        db.ref('athletes/' + uid).set({
            username: uid,
            completed: JSON.stringify(body)
        });
        resolve({});
    })
}

// function resetAllData() {
//     console.log(`${getDate()}: resetAllData`)
//     allAthletes.forEach(a => {
//         db.ref(`athletes/${a}`).set({
//             username: a,
//             completed: '[]'
//         });
//     });
// }

function updateRank() {
    fetchData().then(res => {
        if (res) {
            console.log(`${getDate()}: Updating List`)
            rank = res.reverse();
        }
    }, err => console.log(`${getDate()}: Error: ${err}`));
}

updateRank();
setInterval(() => updateRank(), 30000)