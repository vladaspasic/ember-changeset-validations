import { setContainer } from 'ember-changeset-validations/utils/get-messages';

export function initialize(appInstance) {
  setContainer(appInstance);
}

export default {
  name: 'ember-changeset-validations',
  initialize
};
