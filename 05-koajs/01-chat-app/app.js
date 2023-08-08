const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

const subscribers = [];

router.get('/subscribe', async (ctx) => {
  ctx.body = await new Promise((res) => {
    const cb = (msg) => res(msg);
    subscribers.push(cb);
  });
});

router.post('/publish', async (ctx) => {
  const { message } = ctx.request.body;
  ctx.status = 200;

  if (!message) return;

  subscribers.forEach((fn) => fn(message));
  subscribers.splice(0);
});

app.use(router.routes());

module.exports = app;
