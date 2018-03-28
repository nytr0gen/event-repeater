const assert = require('assert');
const EventRepeater = require('./index');
const moment = require('moment');

describe('EventRepeater', function() {
    const now = Date.now();
    const ev = new EventRepeater({
        startDate: new Date(now),
        endDate: new Date(now + 2000),
        repeatFrequency: 1,
        repeatInterval: 'day',
    });
    const evDefault = new EventRepeater({
        startDate: new Date(now),
        endDate: new Date(now + 2000),
    });

    describe('#isValid()', function() {
        it('should be valid', function () {
            for (let i = 1000; i < 500; i++) {
                const d = ev.incrementDate(now, i);
                assert(ev.isValid(d));
            }
        });

        it('should be valid without repeat', function () {
            assert(evDefault.isValid(evDefault.start), 'start valid');
            assert(evDefault.isValid(evDefault.end), 'end valid');
            assert(!evDefault.isValid(moment(evDefault.end).add(10, 's')), 'end + 10s invalid');
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
            assert(ev2.isValid(d1), '4 repeats after valid');

            const d2 = ev2.incrementDate(now, 5);
            assert(!ev2.isValid(d2), '5 repeats after invalid');

            const d3 = ev2.incrementDate(now, 6);
            assert(!ev2.isValid(d3), '6 repeats after invalid');
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
        it('should work with repeat', function () {
            const items = ev.next(11);
            assert.equal(11, items.length);
        });

        it('should end after 5 occurences', function () {
            const ev2 = new EventRepeater({
                ...ev.opts,
                ends: 5,
            });

            const items = ev2.next(10);
            assert.equal(5, items.length);
        });

        it('should end after 3 days', function () {
            const ev2 = new EventRepeater({
                ...ev.opts,
                ends: moment(now).add(3, 'd').toDate(),
            });

            const items = ev2.next(10);
            assert.equal(3, items.length);
            assert(items[0].start.unix(), ev2.start.unix());
            assert(items[0].end.unix(), ev2.end.unix());
        });

        it('should work default', function () {
            const items = evDefault.next(11);
            assert.equal(1, items.length);
            assert(items[0].start.unix(), evDefault.start.unix());
            assert(items[0].end.unix(), evDefault.end.unix());
        });
    });
});
