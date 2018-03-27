const Joi = require('joi');
const moment = require('moment');

// start date: 06-03-2018 12:00
// end date: 06-03-2018 20:00
// repeat frequency: 1 / 2 / 3 ...
// repeat interval: every day / week / month / year
// ends: never / after n occurences / on 20-03-2018 20:00

class Interval {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }

    isValid(date) {
        return (this.start.valueOf() <= value
            && value <= this.end.valueOf());
    }
}

const OPTS_SCHEMA = Joi.object().keys({
    startDate: Joi.date().required(),
    endDate: Joi.date().required()
        .min(Joi.ref('startDate')),
    repeatFrequency: Joi.number().optional()
        .greater(0)
        .default(1),
    repeatInterval: Joi.string().optional()
        .only('day', 'week', 'month', 'year')
        .default('day'),
    ends: Joi.alternatives().try(
            Joi.number().greater(0),
            Joi.date().min(Joi.ref('startDate'))
        ).optional()
        .allow(null)
        .default(null),
});

class EventRepeater {
    constructor(opts) {
        const model = Joi.validate(opts, OPTS_SCHEMA);
        if (model.error) {
            throw model.error;
        }

        this.opts = model.value;

        this.start = moment(this.opts.startDate);
        this.end = moment(this.opts.endDate);
        this.range = this.end.unix() - this.start.unix();

        this.addInput = this.opts.repeatFrequency;
        this.addValue = this.opts.repeatInterval;

        this.endsAt = null;
        if (typeof(this.opts.ends) === 'number') {
            this.endsAt = this.incrementDate(this.start, this.opts.ends);
        } else if (this.opts.ends instanceof Date) {
            this.endsAt = moment(this.opts.ends);
        }
    }

    incrementDate(date, multiplier = 1) {
        return moment(date).add(multiplier * this.addInput, this.addValue);
    }

    isExpired(date) {
        return this.endsAt && date.isSameOrAfter(this.endsAt);
    }

    next(n) {
        const items = [];
        for (let i = 0; i < n; i++) {
            const start = this.incrementDate(this.start, i);
            const end = this.incrementDate(this.end, i);
            if (this.isExpired(start)) {
                break;
            }

            items.push(new Interval(start, end));
        }

        return items;
    }

    isValid(date) {
        if (!moment.isMoment(date)) {
            date = moment(date);
        }
        if (this.isExpired(date)) {
            return false;
        }

        // binary search
        let lo = 0;
        let hi = 1e6; // 1,000,000 days / months / weeks / years
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            const d = this.incrementDate(this.start, mid);
            if (d.isBefore(date)) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }

        let i = (hi + lo) >> 1;
        let start;
        do {
            start = this.incrementDate(this.start, i);
            i--;
        } while (start.isAfter(date));

        const end = moment(start).add(this.range, 's');

        return start.isSameOrBefore(date) && date.isSameOrBefore(end);
    }
}

module.exports = EventRepeater;
module.exports.Interval = Interval;
