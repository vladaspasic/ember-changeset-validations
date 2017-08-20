import Ember from 'ember';
import getMessages, { setContainer } from 'ember-changeset-validations/utils/get-messages';
import defaultMessages from 'ember-changeset-validations/utils/messages';
import { test, module } from 'ember-qunit';
import buildRegistry from 'ember-test-helpers/build-registry';
import resolver from '../../helpers/resolver';

const MockService = Ember.Service.extend({
  t(key = '') {
    return `Message for ${key}`;
  }
});

const Messages = Ember.ObjectProxy.extend({
  mock: Ember.inject.service(),
  getMessage(key = '') {
    return this.get('mock').t(key);
  },
  custom: '[CUSTOM] This is a custom message'
});

module('Unit | Utility | get messages with container', {
  beforeEach() {
    const items = buildRegistry(resolver);

    this.container = items.container;
    this.registry = items.registry;

    // Register mock service
    this.registry.register('service:mock', MockService);

    setContainer(this.container);
  },
  afterEach: function() {
    setContainer(null);
  }
});

test('it loads object class', function(assert) {
  this.registry.register('validation:messages', Messages);
  let messages = getMessages();

  // It has all the default messages
  Object.keys(defaultMessages).forEach(k => {
    assert.ok(Ember.get(messages, k));
    assert.equal(Ember.get(messages, k), Ember.get(defaultMessages, k), `Missing message for ${k}`);
  });

  // Check for custom message which means we loaded the right file
  assert.ok(Ember.get(messages, 'custom'), 'It has the custom message');

  // Check if the defaults are applied
  assert.deepEqual(Ember.get(messages, 'defaults'), defaultMessages, 'Missing default messages');

  // Check for custom message which means we loaded the right file
  assert.equal(messages.getMessage('key'), 'Message for key', 'It has a message from service');
});

test('it loads object instance', function(assert) {
  this.registry.register('validation:messages', Messages.create());
  let messages = getMessages();

  // It has all the default messages
  Object.keys(defaultMessages).forEach(k => {
    assert.ok(Ember.get(messages, k));
    assert.equal(Ember.get(messages, k), Ember.get(defaultMessages, k), `Missing message for ${k}`);
  });

  // Check for custom message which means we loaded the right file
  assert.ok(Ember.get(messages, 'custom'), 'It has the custom message');

  // Check if the defaults are applied
  assert.deepEqual(Ember.get(messages, 'defaults'), defaultMessages, 'Missing default messages');
});

test('it uses a custom lookup function', function(assert) {
  this.registry.register('validation:messages', Messages.extend({
    messageForKey(key) {
      return key === 'custom-lookup' ? 'Custom lookup' : null;
    }
  }));
  let messages = getMessages();

  // It has all the default messages
  Object.keys(defaultMessages).forEach(k => {
    assert.ok(Ember.get(messages, k));
    assert.equal(Ember.get(messages, k), Ember.get(defaultMessages, k), `Missing message for ${k}`);
  });

  // Check for custom message which means we loaded the right file
  assert.ok(Ember.get(messages, 'custom'), 'It has the custom message');
  assert.equal(Ember.get(messages, 'custom-lookup'), 'Custom lookup', 'It has the custom lookup message');
});

test('it loads plain object', function(assert) {
  let messages = getMessages();

  // It has all the default messages
  Object.keys(defaultMessages).forEach(k => {
    assert.ok(Ember.get(messages, k));
  });

  // Check for custom message which means we loaded the right file
  assert.ok(Ember.get(messages, 'custom'), 'It has the custom message');
});
