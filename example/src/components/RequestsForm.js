import {isInteger, isNullOrUndefined} from '../helpers';
import {JQueryLoader} from './JQueryLoader';
import {Result} from './Result';
import {Instructions} from './Instructions';
import {RequestInput} from './RequestInput';
import {ProxySetup} from './ProxySetup';
import React, { Component } from 'react';
import $ from 'jquery';
import Q from 'q';

const smalltalk = require('smalltalk');
const request = require('request-promise');
const Button = require('react-bootstrap').Button;
const ButtonGroup = require('react-bootstrap').ButtonGroup;
const parser = require('boolean-parser');

const AUTH_HANDLING_EXCEPTION = "The program entered an illegal state when handling auth because it was asked to use a value other than a username or password. See handleAuthChange() to debug.";
const ILLEGAL_PARSE_EXCEPTION = "The program entered an illegal state because it was asked to parse somehting other than params or headers. See parse() to debug.";
const NEED_INTEGER_PARENT = "You have to enter an integer for the parent request";
const PARENT_OUT_OF_BOUNDS = "The number you input wasn't a valid parent request";
const NO_CONDITIONS_GIVEN = "You didn't specify any conditions, so I didn't add any";
const NOT_RUN = "This request didn't fire because its conditions weren't met";
const NO_URL = "You didn't specify a URL for this request";
const ARRAY_INDEX_NEEDS_INT = "You must use integers when indexing into an array";

function AuthHandlingException() {
  return AUTH_HANDLING_EXCEPTION;
}

function IllegalParseTypeException() {
  return ILLEGAL_PARSE_EXCEPTION;
}

class RequestsForm extends Component {
  /**
   * @constructor
   * @param  {Object} props - props
   */
  constructor(props) {
    super(props);
    this.state = {
      requests: [],
      results: [],
      paramStrings: [],
      auth: {user: '', pass: ''},
      headersStrings: [],
      conditions: []
    };

    this.handleUrlChange = this.handleUrlChange.bind(this);
    this.handleTypeChange = this.handleTypeChange.bind(this);
    this.handleParamChange = this.handleParamChange.bind(this);
    this.handleAuthChange = this.handleAuthChange.bind(this);
    this.handleHeadersChange = this.handleHeadersChange.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleConditionalAdd = this.handleConditionalAdd.bind(this);
    this.handleConditionDelete = this.handleConditionDelete.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.parse = this.parse.bind(this);
    this.reset = this.reset.bind(this);
  }

  /**
   * Resets the state, except for auth
   */
  reset() {
    this.setState({
      headersStrings: [],
      paramStrings: [],
      requests: [],
      results: [],
      conditions: []
    });
  }

  /**
   * Handle changing user/password of for proxy auth
   * @param  {SyntheticEvent} event - the React DOM event to handle
   * @param  {String} type - one of 'user' or 'pass'
   */
  handleAuthChange(event, type) {
    let val = event.target.value;
    let auth = this.state.auth;
    switch(type) {
      case 'user':
        auth.user = val;
        break;
      case 'pass':
        auth.pass = val;
        break;
      default:
        throw new AuthHandlingException();
    }
    this.setState({
      auth: auth
    });
  }

  /**
   * Handle changing the url of a request
   * @param  {SyntheticEvent} event - the React DOM event to handle
   * @param  {Number} i - index of the request whose url is being changed
   */
  handleUrlChange(event, i) {
    let url = event.target.value;
    let requests = this.state.requests;
    let request = {
      url: url,
      type: 'get',
      params: null,
      headers: null
    }
    requests[i] = request;
    this.setState({
      requests: requests
    });
  }

  /**
   * Handle changing the REST request type (ie GET/POST) of a request
   * @param  {SyntheticEvent} event - the React DOM event to handle
   * @param  {Number} i - index of the request whose type is being changed
   */
  handleTypeChange(event, i) {
    let requests = this.state.requests;
    let request = requests[i];
    request.type = event.target.value;
    requests[i] = request;
    this.setState({
      requests: requests
    });
  }

  /**
   * Handle changing the parameters of a request
   * @param  {SyntheticEvent} event - the React DOM event to handle
   * @param  {Number} i - index of the request whose parameters are being changed
   */
  handleParamChange(event, i) {
    let paramStrings = this.state.paramStrings;
    let paramString = event.target.value;
    paramStrings[i] = paramString;
    this.setState({
      paramStrings: paramStrings
    });
  }

  /**
   * Handle changing the headers of a request
   * @param  {SyntheticEvent} event - the React DOM event to handle
   * @param  {Number} i - index of the request whose headers are being changed
   */
  handleHeadersChange(event, i) {
    let headersStrings = this.state.headersStrings;
    let headerString = event.target.value;
    headersStrings[i] = headerString;
    this.setState({
      headersStrings: headersStrings
    });
  }

  /**
   * Handle submitting all requests in order, taking past values and teh satisfaction of conditions into account.
   * @param  {SyntheticEvent} event - the React DOM event to handle
   */
  handleSubmit(event) {
    let setState = this.setState.bind(this);
    let results = [];
    let conditions = this.state.conditions;
    let requests = this.state.requests;

    this.parse('params');
    this.parse('headers');

    //Reduce iterates over an array, applying a function to each value which is a function of that value, as well as the previous
    //function's return. In our case, we make a request based on currentRequest and the results of all previous requests up to now.
    //For documentation on reduce see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
    let chain = requests.reduce((previous, currentRequest, index) => {
      return previous.then((previousValue) => {
        let url = currentRequest.url;
        if (!url) {
          results.push(NO_URL);
          return;
        }
        let inputParams = requests[index].params;
        let params = paramsWithReferencedValues(inputParams, results, index);
        if (isNullOrUndefined(conditions[index]) || allConditionsSatisfied(conditions, results, index)) {
          let data = makeRestReqObject(currentRequest, params);
          request(data).then(json => results.push(json));
        } else {
          results.push(NOT_RUN);
        }
      })
      .then(() => {
        setState({results: results});
        return Q.delay(1000);
      })
    }, Q.resolve([]));

    chain.then(() => setState({results: results}));

    if (event) {
      event.preventDefault();      
    }
  }

  /**
   * Handle adding a new request
   * @param  {SyntheticEvent} event - the React DOM event to handle
   */
  handleAdd(event) {
    let results = this.state.results;
    let requests = this.state.requests;
    let conditions = this.state.conditions;
    let headersStrings = this.state.headersStrings;
    let paramStrings = this.state.paramStrings;
    headersStrings.push(null);
    conditions.push(null);
    results.push(null);
    requests.push({params: {}, type: 'GET', url: '', headers: {}});
    paramStrings.push(null);
    this.setState({
      headersStrings: headersStrings,
      results: results,
      requests: requests,
      conditions: conditions,
      paramStrings: paramStrings
    });
  }

  /**
   * Handle adding conditions to a request
   * @param  {SyntheticEvent} event - the React DOM event to handle
   * @param  {Number} i - index of the request whose conditions are being added to
   */
  handleConditionalAdd(event, i) {
    let requests = this.state.requests;
    let conditions = this.state.conditions;
    smalltalk.prompt('CONDITIONS FOR REQUEST ' + i, 'What request number does your condition for request ' + i + ' depend on?')
    .then((parent) => {
      parent = parseInt(parent, 10);
      if (!isInteger(parent)) {
        alert(NEED_INTEGER_PARENT);
        return;
      } 
      if (parent < 0 || parent >= requests.length) {
        alert(PARENT_OUT_OF_BOUNDS);
        return;
      }
      smalltalk.prompt('CONDITIONS FOR REQUEST ' + i, "When should request " + i + " fire, depening on the result of request " + parent + "?")
      .then((requestConditionsString) => {
        if (isNullOrUndefined(requestConditionsString) || requestConditionsString === '') {
          alert(NO_CONDITIONS_GIVEN);
          return;
        }
        let oldConditions = conditions[i];
        let requestConditions = parseConditions(requestConditionsString, parent);
        if (checkConditionsFormat(requestConditions)) {
          if (!oldConditions) {
            conditions[i] = [requestConditions];
          } else {
            conditions[i].push(requestConditions);
          }
        }
        this.setState({conditions: conditions});
      })
    })
  }

  /**
   * Handle deleting the conditions required to fire a request
   * @param  {SyntheticEvent} event - the React DOM event to handle
   * @param  {Number} i - index of the request whose conditions are being removed
   */
  handleConditionDelete(event, i) {
    let conditions = this.state.conditions;
    conditions[i] = null;
    this.setState({conditions: conditions});
  }


  /**
   * Converts headersStrings or paramStrings into the headers and params child-objects for every request
   * @param  {String} type - one of 'headers' or 'params'
   */
  parse(type) {
    let requests = this.state.requests;
    let stringsToParse;
    switch(type) {
      case 'headers':
        stringsToParse = this.state.headersStrings;
        break;
      case 'params':
        stringsToParse = this.state.paramStrings;
        break;
      default:
        throw new IllegalParseTypeException();
    }
    for (let i = 0; i < stringsToParse.length; i++) {
      let singleRequestObj = {};
      let singleRequestStr = stringsToParse[i];
      let request = requests[i];
      if (singleRequestStr) {
        let singleRequestArr = singleRequestStr.split(',');
        for (let j = 0; j < singleRequestArr.length; j++) {
          let tempArr = singleRequestArr[j].split('=');
          if (tempArr.length < 2) {
            alert("You didn't format the headers correctly for request number " + i);
            return;      
          }
          let key = tempArr[0].replace(/ /g,'');
          let val = tempArr[1].replace(/ /g,'');
          singleRequestObj[key] = val;
        }
      }
      request[type] = singleRequestObj;
    }
    this.setState({requests: requests});
  }

  /**
   * Renders the RequestsForm
   */
  render() {
    const urls = this.state.requests.map((request) => request.url);
    const results = this.state.results;
    const conditions = this.state.conditions;
    return (
      <div>
        <JQueryLoader />
        <form onSubmit={this.handleSubmit}>
          <div className="controls">
            <div className="buttons">
              <ButtonGroup vertical>
                <Button bsStyle="primary" onClick={this.handleAdd}>Add Request</Button>
                <Button bsStyle="success" type="submit">Submit</Button>
                <Button bsStyle="danger" onClick={this.reset}>Reset</Button>
              </ButtonGroup>
            </div>
            <br />
            <ProxySetup
              onAuthChange={this.handleAuthChange}
            />
          </div>
          {urls.length > 0 && <h2>Requests</h2>}
          {urls.map((url, i) =>
            <div className="requestInput" key={i}>
              <RequestInput 
                i={i} 
                key={i}
                url={url} 
                conditions={conditions[i]}
                onUrlChange={this.handleUrlChange} 
                onTypeChange={this.handleTypeChange}
                onParamChange={this.handleParamChange}
                onHeadersChange={this.handleHeadersChange}
                onConditionsChange={this.handleConditionalAdd}
                onConditionsDelete={this.handleConditionDelete}
              />
            </div>
          )}
          <div id="resultsContainer">
            {results.length > 0 && results[0] != null && <h2>Results</h2>}
            {results != null && results[0] != null && results.map((result, i) => 
              <div id="result" key={i}>
                <h4>Request {i}</h4>
                {conditions[i] != null && conditions[i].map((condition, j) =>
                  <h5 key={i}>Depends on {condition.number} - needs {condition.string}</h5>
                )}
                <Result 
                  key={i}
                  json={result}
                />
              </div>
            )}
          </div>
        </form>
        <Instructions/>
      </div>
    );
  }
}


////////////////////////////////
//           helpers          //
////////////////////////////////

/**
 * Checks if conditions in a truth-assignment array (see conditionsArr in validateConditions()) is formatted
 * correctly. Will reject if any condition isn't in the form "key0.key1...keyN=val", or if any key has square
 * brackets (ie is indexing into an array) but uses something other than an integer as index.
 * 
 * @param  {Object} conditions - an object in the form {conditions: [[]...], number: n, string: "..."}.
 *                                  The `conditions` nested-array is the conditionsArr explained in the 
 *                                  documentation for validateConditions(). The `number` is the index of
 *                                  the request which the conditions depend on. The `string` is a string 
 *                                  representation of those conditions (it is the string which the user
 *                                  input when specifying the conditions, which gets parsed into `conditions`).
 * @return {Boolean} true if conditions are formatted correctly, false otherwise.
 */
function checkConditionsFormat(conditions) {
  let num = conditions.number;
  let conditionsArr = conditions.conditions;
  for (let i = 0; i < conditionsArr.length; i++) {
    for (let j = 0; j < conditionsArr[i].length; j++) {
      let condition = conditionsArr[i][j].split('=');
      if (condition.length !== 2) {
        alert("One of your conditions for request " + num + " was improperly formatted");
        return false;
      }
      let keyPath = condition[0].trim().split('.');
      for (let k = 0; k < keyPath.length; k++) {
        let currStep = keyPath[k];
        let len = currStep.length;
        let index;
        if (currStep.indexOf('[') !== -1 && currStep.indexOf(']') !== -1) {
          index = parseInt(currStep.charAt(len - 2), 10);
          if (!isInteger(index)) {
            alert(ARRAY_INDEX_NEEDS_INT);
            return false;
          }
        }
      }
    }
  }
  return true;
}

/**
 * Parses the user's string input expressing a condition into a conditions Object. 
 * 
 * @param  {String} conditionInput - a string that the user writes specifying a condition. 
 * @param  {Number} num - the index of the request which this condition depends on
 * @return {Object} conditionsObj - an object in the form {conditions: [[]...], number: n, string: "..."}.
 *                                  The `conditions` nested-array is the conditionsArr explained in the 
 *                                  documentation for validateConditions(). The `number` is the index of
 *                                  the request which the conditions depend on. The `string` is a string 
 *                                  representation of those conditions (it is the string which the user
 *                                  input when specifying the conditions, which gets parsed into `conditions`).
 */
function parseConditions(conditionInput, num) {
  let conditionsObj = {
    number: num,
    conditions: null,
    string: conditionInput
  };
  let conditions = parser.parseBooleanQuery(conditionInput);
  conditionsObj.conditions = conditions;
  return conditionsObj;
}

/**
 * Turns a params object which refers to the result of a previous request into a params object which uses the
 * appropriate values from the referred request's response as its values. For example, suppose Request 1 has 
 * parameters {key0=~name} and the result of Request 0 was {name: "Arbie"}. Then calling 
 * paramsWithReferencedValues({key0=~name}, [{name: "Arbie"}], 1) would give {key0: "name"}
 * 
 * @param  {Object} inputParams - the params object which needs to have its values updated based on past requests
 * @param  {Array} results - the results of all previous requests
 * @param  {Number} i - the number of the request whose params object has to be updated
 * @return {Object} params - updated version of inputParams
 */
function paramsWithReferencedValues(inputParams, results, i) {
  var params = {};
  for (let key in inputParams) {
    if (inputParams.hasOwnProperty(key)) {
      let val = inputParams[key];
      //number of requests backwards to refer to to get value of param
      //syntax is ~key0.key1 to refer back one request, ~~key0.key1 for two requests etc
      //so the referBackIndex is the # of '~' symbols
      let referBackIndex = (val.match(/~/g)||[]).length;
      let referBackString = val.replace(/~/g, '');
      if (referBackIndex > 0) {
        if (referBackIndex > i) {
          //referBackIndex is referring too far back (to a request before the 0th request)
          alert('You referred back ' + referBackIndex + ' requests on request number ' + i + '. Fix and try again');
          return;
        } else {
          //get value from request result referBackIndex back
          let resultIndex = i - referBackIndex;
          let prevResultJson = results[resultIndex];
          let currentVal = prevResultJson;
          var pathToValue = referBackString.split('.');
          for (var j = 0; j < pathToValue.length; j++) {
            currentVal = currentVal[pathToValue[j]];
            if (!currentVal) {
              alert("Couldn't get the value of param `" + referBackString + "` from request number " + resultIndex + ". Check the path and try again");
              return;
            }
          }
          params[key] = currentVal;
        }
      } else {
        params[key] = val;
      }
    }
  }
  return params;
}

/**
 * Builds a Headers object from a request
 * 
 * @param  {Object} currentRequest - a request object in the format {params: {...}, type: '...', url: '...', headers: {...}}
 * @return {Headers} headers - a Headers object using the keys/values in currentRequest.headers
 */
function buildHeaders(currentRequest) {
  let headers = new Headers();
  for (let key in currentRequest.headers) {
    if (currentRequest.headers.hasOwnProperty(key)) {
      let val = currentRequest.headers[key];
      headers.append(key, val);
    }
  }
  return headers;
}

/**
 * @param  {Object} currentRequest - a request object in the format {params: {...}, type: '...', url: '...', headers: {...}}
 * @param  {Object} params - a params object. See paramsWithReferencedValues() for documentation of the format of this object.
 * @return {Object} data - an object containing the url, headers, and method for an HTTP request, ready for request-promise 
 */
function makeRestReqObject(currentRequest, params) {
  let data = {};
  let url = currentRequest.url;
  url = url + "?" + $.param(params);
  data.headers = buildHeaders(currentRequest);
  data.method = currentRequest.type.toUpperCase();
  data.json = true;
  data.url = url;
  if (url.includes('https')) {
    // todo: get the below commented out code working and use auth instead of switching to http
    // let agent = new HttpsProxyAgent('http://' + auth.user + ":" + auth.pass + "@oproxy.fg.rbc.com:8080/");
    // data.agent = agent;
    data.url = url.replace('https', 'http');
  } 
  return data;
}

/**
 * Checks if conditions depending on a single parent result are met.
 * @param  {Array} conditionsArr - all conditions for one request depending on a single parent result
 *                                  conditionsArr is an array of nested arrays. Each nested array corresponds
 *                                  to one truth-assigment to all of the individual requirements of a condition
 *                                  which would make the whole condition true. Hence, conditions are met if at 
 *                                  least one subarray (representing a truth-assignment) has all of its requirements
 *                                  met. To see a real life example of a conditions array, open up Postmen and the 
 *                                  react devtools, and add a condition to Request 1 which depends on Request 0
 *                                  and has the condition `(key0=val0 AND val1 = val1) OR key2=val2`. Inspecting
 *                                  the root RequestsForm object, conditions[1][0].conditions is a conditionsArr.
 * @param  {Object} parentResult - JSON of the parent result
 * @return {Boolean} true if the conditions are met, false otherwise
 */
function validateConditions(conditionsArr, parentResult) {
  let currVal;
  for (let i = 0; i < conditionsArr.length; i++) {
    let hasMatch = true;
    for (let j = 0; j < conditionsArr[i].length; j++) {
      let negated = false;
      currVal = parentResult;
      let condition = conditionsArr[i][j].split('=');
      if (condition[0].endsWith("!")) {
        negated = true;
        condition[0] = condition[0].substring(0, condition[0].length - 1);
      }
      let keyPath = condition[0].trim().split('.');
      let val = condition[1].trim();
      for (let k = 0; k < keyPath.length; k++) {
        let currStep = keyPath[k];
        let len = currStep.length;
        let index;
        if (currStep.indexOf('[') === len - 3 && currStep.indexOf(']') === len - 1) {
          index = parseInt(currStep.charAt(len - 2), 10);
          if (!isInteger(index)) {
            alert(ARRAY_INDEX_NEEDS_INT);
            return;
          }
          currStep = currStep.substring(0, len - 3);
        }
        currVal = currVal[currStep];
        if (index != null) {
          currVal = currVal[index];
        }
        if (!currVal) {
          alert("One of your conditions for request " + i + " references a parameter that doesn't exist");
        }
      }
      if ((negated && val === currVal) || (!negated && val !== currVal)) {
        hasMatch = false;
      }
    }
    if (hasMatch) {
      return true;
    }
  }
  return false;
}

/**
 * Requests can have conditions depending on more than one parent result. Each parent result has an associated
 *                                conditionsArr and parent result. This runs validateConditions on each such 
 *                                conditionsArr and parent, returning true if all of the individual dependencies 
 *                                are satisfied. 
 *                                
 * @param  {Array} conditions - an array of conditionsArr arrays. see the documentation for validateConditions() 
 *                                for a description of conditionsArr arrays.                        
 * @param  {Array} results - an array of previous results. Each result is JSON. 
 * @param  {Number} index - the number of the request whose conditions we are checking.
 * @return {Boolean} true if all conditions are met, false otherwise.
 */
function allConditionsSatisfied(conditions, results, index) {
  for (let i = 0; i < conditions[index].length; i++) {
    let parentNum = conditions[index][i].number;
    let parent = results[parentNum];
    let conditionsArr = conditions[index][i].conditions;
    if (!validateConditions(conditionsArr, parent)) {
      return false;
    }
  }
  return true;
}

export{RequestsForm};