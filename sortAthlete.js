'use strict';
const names = require('./views/names.json')

module.exports = function () {
    return {
        calcRepetitions(completed) {
            let countBlocks = {}
            for (let i = 0; i < 40; i++) {
                countBlocks[i] = 0
            }
            Object.keys(completed).forEach(at => {
                let blocks = JSON.parse(completed[at].completed);
                blocks.forEach(num => countBlocks[num]++)
            });
            return countBlocks;
        },

        sortAthl(obj) {
            let calcPoints = {}
            Object.keys(obj).forEach(athlete => {
                let blockDone = JSON.parse(obj[athlete].completed)
                let repetitions = this.calcRepetitions(obj);
                if (blockDone.length) calcPoints[athlete] = this.sum(blockDone, repetitions)
            })
            return calcPoints
        },

        sum(arr, repetitions) {
            let point = 0
            arr.forEach(b => point += 1000 / repetitions[b])
            return point;
        },
        orderObjByScore(obj) {
            let sorted = this.sortAthl(obj);
            let sortable = [];
            for (let athl in sorted)
                sortable.push([athl, sorted[athl]]);
            sortable.sort((a, b) => a[1] - b[1]);
            return sortable.map(e => {
                return { name: names[e[0]], score: e[1] }
            });
        }
    }
};