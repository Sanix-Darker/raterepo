# RateRepo

A simple web extension that rate from you a github repository based on some elements and a small formula :

```javascript
const rating = (
    (stars / 5) + (commits / 7) + (commitFrequency / 5) +
    (contributors / 4) + (forks / 5) + (releases / 3) +
    (issueFrequency / 7) + (watchers / 10) + isArchived + (branches / 3)
) / (stars + commits + commitFrequency + contributors + forks + releases +
    issueFrequency + watchers + isArchived + branches)
```

![screen](./screen.png)
