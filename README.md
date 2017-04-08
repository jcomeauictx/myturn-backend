# Myturn Backend

Open source collaborative upgrade of David Stodolsky's [myturnb](https://github.com/DavidStodolsky/myturnb) project.

This requires NodeJS version 6 or higher, due to use of `const` expressions like that found on [line 7 of app/group/groupSockets.js](https://github.com/MyTurn-OpenSource/myturn-backend/blob/master/app/group/groupSockets.js#L7).

If installing with `npm` version 3 or higher, make sure to use the `--legacy-bundling` option:

    npm install --legacy-bundling jcomeauictx/myturn-backend

Without this, the `node-myturn-backend` startup script will not be able to find the `forever` binary.
