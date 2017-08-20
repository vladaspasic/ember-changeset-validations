/* globals requirejs, requireModule */
import Ember from 'ember';
import defaultMessages from 'ember-changeset-validations/utils/messages';
import withDefaults from 'ember-changeset-validations/utils/with-defaults';

const { A: emberArray, canInvoke, get, isNone, isPresent, typeOf } = Ember;
const { keys } = Object;
const matchRegex = /validations\/messages$/gi;

/**
 * Mixin that is used to expose a simple Message API to custom
 * Ember objects.
 */
const mixin = Ember.Mixin.create({
 
  /**
   * Default messages object
   * 
   * @type {Object}
   */
  defaults: null,

  /**
   * Define a `messageForKey` method if you wish to implement your own custom message lookup.
   * If the method returns `null` or `undefined`, default message would be returned.
   *
   * @param key {String} Message key to find
   * @return {String}
   */
  unknownProperty(key = '') {
    let value;

    // Check if there is a custom lookup function defined
    if (canInvoke(this, 'messageForKey')) {
      value = this.messageForKey(key);
    }

    // Play nice with ObjectProxy instances
    if (isNone(value)) {
      value = this._super(key);
    }

    // Load default message
    if (isNone(value)) {
      value = get(this, `defaults.${key}`);
    }

    return value;
  }
});

let container = null;
let cachedRef = null;

function applyDefaults(obj = {}, defaults = {}) {
  return obj.reopen(mixin, { defaults });
}

/**
 * Load the messages from the Ember Container.
 * 
 * @param  {Object} defaultMessages 
 * @return {Object}
 */
function loadFromContainer(defaultMessages = {}) {
  let factory = container.factoryFor('validation:messages');

  if (isNone(factory)) {
    return null;
  }

  if (isPresent(factory.class)) {
    factory = factory.class;
  }

  const type = typeOf(factory);

  if (type === 'class') {
    // reopen class to set default messages
    applyDefaults(factory, defaultMessages);
    return container.lookup('validation:messages');
  } else if (type === 'instance') {
    // reopen class to set default messages
    return applyDefaults(factory, defaultMessages);
  } else if (type === 'object') {
    // Merge the user specified messages with the defaults
    return withDefaults(factory, defaultMessages);
  } else {
    throw new Ember.Error('You custom `messages.js` file must export an `Ember.ObjectProxy` or `Object` instance.');
  }
}

/**
 * Load the messages from a defined module map.
 * 
 * @param  {Object} defaultMessages 
 * @return {Object}
 */
function loadFromModuleMap(moduleMap = {}, defaultMessages = {}) {
  const moduleKey = emberArray(keys(moduleMap))
    .find((module) => isPresent(module.match(matchRegex)));

  if (isPresent(moduleKey)) {
    // Merge the user specified messages with the defaults
    return withDefaults(requireModule(moduleKey).default, defaultMessages);
  }

  return null;
}

/**
 * Find and load messages module on consuming app. Defaults to addon messages.
 * To define a custom message map, create `my-app/app/validations/messages.js`
 * and export an object.
 *
 * @param  {Object} moduleMap
 * @param  {Boolean} useCache Pass `false` to ignore cached key
 * @return {Object}
 */
export default function getMessages(moduleMap = requirejs.entries, useCache = true) {
  if (useCache && isPresent(cachedRef)) {
    return cachedRef;
  }

  let messagesModule = null;

  if (isPresent(container)) {
    messagesModule = loadFromContainer(defaultMessages);
  }

  if (isNone(messagesModule)) {
    messagesModule = loadFromModuleMap(moduleMap, defaultMessages);
  }

  if (isNone(messagesModule)) {
    messagesModule = defaultMessages;
  }

  cachedRef = messagesModule;
  return messagesModule;
}

export function setContainer(cont = null) {
  container = cont;
  cachedRef = null;
}
