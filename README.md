# RateRepo

A simple web extension that rate from you a github repository based on some elements and a small formula :

```javascript
const rating = (
    (stars / 10) +
    (commits / 10) +
    (commitFrequency / 2) +
    (contributors / 5) +
    (forks / 5) +
    (releases / 2) +
    (issueFrequency / 5) +
    (watchers / 10)
);
```
