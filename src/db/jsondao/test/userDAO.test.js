import userDAO from '../userDAO.js';
import assert from 'assert';

describe('#create()', function () {
  it('responds with matching records', async function () {
    const user = await userDAO.create({
      username: 'admin',
      password: '123456',
      role: 'manager',
      status: 1,
    });
    assert.equal(user.password, '123456');
  });
});

describe('#query()', function () {
  it('responds with matching records', async function () {
    const user = await userDAO.query({ username: 'admin' });
    assert.equal(user.password, '123456');
  });
});

describe('#update()', function () {
  it('responds with matching records', async function () {
    let user = await userDAO.query({ username: 'admin' });
    user = await userDAO.update(user.id, { password: '654321' });
    user = await userDAO.query({ username: 'admin' });
    assert.equal(user.password, '654321');
  });
});

describe('#delete()', function () {
  it('responds with matching records', async function () {
    let user = await userDAO.query({ username: 'admin' });
    await userDAO.remove(user.id);
    user = await userDAO.query({ username: 'admin' });
    assert.equal(user, null);
  });
});
