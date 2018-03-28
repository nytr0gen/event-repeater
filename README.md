# Event Repeater

Event Repeater is a solution for creating events like those in Google Calendar. You want to have an event from 9:00 AM to 9:00 PM on every Wednesday, that ends after 11 occurences? I got you covered.

```bash
npm install --save event-repeater
yarn add event-repeater
```

# Example
```javascript
const ev = new EventRepeater({
    startDate: new Date('2018-03-28T09:00:00.000Z'),
    endDate: new Date('2018-03-28T21:00:00.000Z'),
    repeatFrequency: 1,
    repeatInterval: 'week',
    ends: 11, // after 11 occurences
});

ev.next(10); // list of the next 10 events

ev.isValid(new Date('2018-03-28T20:00:00.000Z')); // true
ev.isValid(new Date('2018-03-28T22:00:00.000Z')); // false
```

# Webpack
Using it in **Frontend** with **Webpack**? No problemo. Just merge this into your `webpack.config.js`
```javascript
{
    node: {
        net: 'mock'
    }
}
```
