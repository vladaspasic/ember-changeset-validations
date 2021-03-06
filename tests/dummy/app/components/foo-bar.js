import Ember from 'ember';
import { validatePresence, validateLength } from 'ember-changeset-validations/validators';

const { Component } = Ember;

const rulez = {
  firstName: [
    validatePresence(true),
    validateLength({ min: 2 })
  ],
  lastName: [
    validatePresence(true),
    validateLength({ min: 2 })
  ]
};

const schema = {
  firstName: null,
  lastName: null
};

export default Component.extend({
  rulez,
  schema
});
