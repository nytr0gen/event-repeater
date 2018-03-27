const assert = require('assert');
const EventRepeater = require('./index');
const moment = require('moment');

describe('EventRepeater', function() {
    const now = Date.now();

    describe('#isValid()', function() {
        const ev = new EventRepeater({
            startDate: new Date(now),
            endDate: new Date(now + 2000),
            repeatFrequency: 1,
            repeatInterval: 'day',
        });

        it('should be valid', function () {
            for (let i = 1000; i < 500; i++) {
                const d = ev.incrementDate(now, i);
                assert(ev.isValid(d));
            }
        });

        it('should not be valid', function () {
            for (let i = 1000; i < 500; i++) {
                const d = ev.incrementDate(now, i).add(3000, 'ms');
                assert(!ev.isValid(d));
            }
        });

        const ev2 = new EventRepeater({
            ...ev.opts,
            ends: 5,
        });

        it('should expire', function () {
            const d1 = ev2.incrementDate(now, 4);
            assert(ev2.isValid(d1));

            const d2 = ev2.incrementDate(now, 5);
            assert(!ev2.isValid(d2));

            const d3 = ev2.incrementDate(now, 6);
            assert(!ev2.isValid(d3));
        });

        const ev3 = new EventRepeater({
            ...ev.opts,
            repeatFrequency: 3,
            repeatInterval: 'year',
        });

        it('should be valid with years', function () {
            for (let i = 1000; i < 500; i++) {
                const d = ev3.incrementDate(now, i);
                assert(ev3.isValid(d));
            }
        });

        it('should not be valid with years', function () {
            for (let i = 1000; i < 500; i++) {
                const d = ev3.incrementDate(now, i).add(3000, 'ms');
                assert(!ev3.isValid(d));
            }
        });
    });

    describe('#next()', function() {
        const ev = new EventRepeater({
            startDate: new Date(now),
            endDate: new Date(now + 2000),
            repeatFrequency: 1,
            repeatInterval: 'day',
        });

        it('should work', function () {
            const items = ev.next(11);
            assert.equal(11, items.length);
        });

        it('should end after 5', function () {
            const ev2 = new EventRepeater({
                ...ev.opts,
                ends: 5,
            });

            const items = ev2.next(10);
            assert.equal(5, items.length);
        });

        it('should end after 3', function () {
            const ev2 = new EventRepeater({
                ...ev.opts,
                ends: moment(now).add(3, 'd').toDate(),
            });

            const items = ev2.next(10);
            assert.equal(3, items.length);
        });
    });
});
