import * as iframePh from 'iframe-phone';

let config = null;

var connection = null;
var connectionState = 'preinit';

var stats = {
    countDiReq: 0,
    countDiRplSuccess: 0,
    countDiRplFail: 0,
    countDiRplTimeout: 0,
    countCodapReq: 0,
    countCodapUnhandledReq: 0,
    countCodapRplSuccess: 0,
    countCodapRplFail: 0,
    timeDiFirstReq: null,
    timeDiLastReq: null,
    timeCodapFirstReq: null,
    timeCodapLastReq: null
};

/**
 * A serializable object shared with CODAP. This is saved as a part of the
 * CODAP document. It is intended for the data interactive's use to store
 * any information it may need to reestablish itself when a CODAP document
 * is saved and restored.
 *
 * This object will be initially empty. It will be updated during the process
 * initiated by the init method if CODAP was started from a previously saved
 * document.
 */
let interactiveState = {};

/**
 * A list of subscribers to messages from CODAP
 * @param {[{actionSpec: {RegExp}, resourceSpec: {RegExp}, handler: {function}}]}
 */
let notificationSubscribers = [];
let nextNotificationIndex = 0;

function matchResource(resourceName, resourceSpec) {
    return resourceSpec === '*' || resourceName === resourceSpec;
}

function emptyNotifications() {
    notificationSubscribers = [];
    nextNotificationIndex = 0;
}

function notificationHandler (request, callback) {
    var action = request.action;
    var resource = request.resource;
    var requestValues = request.values;
    var returnMessage = {success: true};

    connectionState = 'active';
    stats.countCodapReq += 1;
    stats.timeCodapLastReq = new Date();
    if (!stats.timeCodapFirstReq) {
        stats.timeCodapFirstReq = stats.timeCodapLastReq;
    }

    if (action === 'notify' && !Array.isArray(requestValues)) {
        requestValues = [requestValues];
    }

    var handled = false;
    var success = true;

    if (action === 'get') {
        // get assumes only one subscriber because it expects only one response.
        notificationSubscribers.some(function (subscription) {
            var result = false;
            try {
                if ((subscription.actionSpec === action) &&
                    matchResource(resource, subscription.resourceSpec)) {
                    var rtn = subscription.handler(request);
                    if (rtn && rtn.success) { stats.countCodapRplSuccess++; } else{ stats.countCodapRplFail++; }
                    returnMessage = rtn;
                    result = true;
                }
            } catch (ex) {
                console.log('DI Plugin notification handler exception: ' + ex);
                result = true;
            }
            return result;
        });
        if (!handled) {
            stats.countCodapUnhandledReq++;
        }
    } else if (action === 'notify') {
        requestValues.forEach(function (value) {
            notificationSubscribers.forEach(function (subscription) {
                if (subscription) {     //  it could be null if it has been removed, so avoid any trouble here...
                    // pass this notification to matching subscriptions
                    handled = false;
                    if ((subscription.actionSpec === action) && matchResource(resource,
                        subscription.resourceSpec) && (!subscription.operation ||
                        (subscription.operation === value.operation) && subscription.handler)) {
                        var rtn = subscription.handler(
                            {action: action, resource: resource, values: value});
                        if (rtn && rtn.success) {
                            stats.countCodapRplSuccess++;
                        } else {
                            stats.countCodapRplFail++;
                        }
                        success = (success && (rtn ? rtn.success : false));
                        handled = true;
                    }
                }
            });
            if (!handled) {
                stats.countCodapUnhandledReq++;
            }
        });
    } else {
        console.log("DI Plugin received unknown message: " + JSON.stringify(request));
    }
    return callback(returnMessage);
}

export const codapInterface = {
    /**
     * Connection statistics
     */
    stats: stats,

    /**
     * Initialize connection.
     *
     * Start connection. Request interactiveFrame to get prior state, if any.
     * Update interactive frame to set name and dimensions and other configuration
     * information.
     *
     * @param iConfig {object} Configuration. Optional properties: title {string},
     *                        version {string}, dimensions {object}
     *
     * @param iCallback {function(interactiveState)}
     * @return {Promise} Promise of interactiveState;
     */
    init: function (iConfig, iCallback) {
        return new Promise(function (resolve, reject) {
            function getFrameRespHandler(resp) {
                var success = resp && resp[1] && resp[1].success;
                var receivedFrame = success && resp[1].values;
                var savedState = receivedFrame && receivedFrame.savedState;
                this_.updateInteractiveState(savedState);
                if (success) {
                    // deprecated way of conveying state
                    if (iConfig.stateHandler) {
                        iConfig.stateHandler(savedState);
                    }
                    resolve(savedState);
                } else {
                    if (!resp) {
                        reject('Connection request to CODAP timed out.');
                    } else {
                        reject(
                            (resp[1] && resp[1].values && resp[1].values.error) ||
                            'unknown failure');
                    }
                }
                if (iCallback) {
                    iCallback(savedState);
                }
            }

            var getFrameReq = {action: 'get', resource: 'interactiveFrame'};
            var newFrame = {
                name: iConfig.name,
                title: iConfig.title,
                version: iConfig.version,
                dimensions: iConfig.dimensions,
                preventBringToFront: iConfig.preventBringToFront
            };
            var updateFrameReq = {
                action: 'update',
                resource: 'interactiveFrame',
                values: newFrame
            };
            var this_ = this;

            config = iConfig;

            // initialize connection
            connection = new iframePh.IframePhoneRpcEndpoint(
                notificationHandler, "data-interactive", window.parent);

            this.on('get', 'interactiveState', function () {
                return ({success: true, values: this.getInteractiveState()});
            }.bind(this));

            console.log('sending interactiveState: ' + JSON.stringify(this.getInteractiveState));
            // update, then get the interactiveFrame.
            return this.sendRequest([updateFrameReq, getFrameReq])
                .then(getFrameRespHandler, reject);
        }.bind(this));
    },

    /**
     * Current known state of the connection
     * @param {'preinit' || 'init' || 'active' || 'inactive' || 'closed'}
     */
    getConnectionState: function () {return connectionState;},

    getStats: function () {
        return stats;
    },

    getConfig: function () {
        return config;
    },

    /**
     * Returns the interactive state.
     *
     * @returns {object}
     */
    getInteractiveState: function () {
        return interactiveState;
    },

    /**
     * Updates the interactive state.
     * @param iInteractiveState {Object}
     */
    updateInteractiveState: function (iInteractiveState) {
        if (!iInteractiveState) {
            return;
        }
        interactiveState = Object.assign(interactiveState, iInteractiveState);
    },

    destroy: function () {
        // todo : more to do?
        connection = null;
    },

    /**
     * Sends a request to CODAP. The format of the message is as defined in
     * {@link https://github.com/concord-consortium/codap/wiki/CODAP-Data-Interactive-API}.
     *
     * @param message {String}
     * @param callback {function(response, request)} Optional callback to handle
     *    the CODAP response. Note both the response and the initial request will
     *    sent.
     *
     * @return {Promise} The promise of the response from CODAP.
     */
    sendRequest: function (message, callback) {
        return new Promise(function (resolve, reject){
            function handleResponse (request, response, callback) {
                if (response === undefined) {
                    console.warn('handleResponse: CODAP request timed out');
                    reject('handleResponse: CODAP request timed out: ' + JSON.stringify(request));
                    stats.countDiRplTimeout++;
                } else {
                    connectionState = 'active';
                    if (response.success) { stats.countDiRplSuccess++; } else { stats.countDiRplFail++; }
                    resolve(response);
                }
                if (callback) {
                    callback(response, request);
                }
            }
            switch (connectionState) {
                case 'closed': // log the message and ignore
                    console.warn('sendRequest on closed CODAP connection: ' + JSON.stringify(message));
                    reject('sendRequest on closed CODAP connection: ' + JSON.stringify(message));
                    break;
                case 'preinit': // warn, but issue request.
                    console.log('sendRequest on not yet initialized CODAP connection: ' +
                        JSON.stringify(message));
                /* falls through */
                default:
                    if (connection) {
                        stats.countDiReq++;
                        stats.timeDiLastReq = new Date();
                        if (!stats.timeDiFirstReq) {
                            stats.timeCodapFirstReq = stats.timeDiLastReq;
                        }

                        connection.call(message, function (response) {
                            handleResponse(message, response, callback);
                        });
                    } else {
                        console.error('sendRequest on non-existent CODAP connection');
                    }
            }
        });
    },

    /**
     * Registers a handler to respond to CODAP-initiated requests and
     * notifications. See {@link https://github.com/concord-consortium/codap/wiki/CODAP-Data-Interactive-API#codap-initiated-actions}
     *
     * @param actionSpec {String} (optional) Action to handle. Defaults to 'notify'.
     * @param resourceSpec {String} A resource string.
     * @param operation {undefined | String} (optional) name of operation, e.g. 'create', 'delete',
     *   'move', 'resize', .... If not specified, all operations will be reported.
     * @param handler {Function} A handler to receive the notifications.
     */
    on: function (actionSpec, resourceSpec, operation, handler) { // eslint-disable-line no-unused-vars
        var as = 'notify',
            rs,
            os,
            hn;
        var args = Array.prototype.slice.call(arguments);
        if (args[0] === 'get' || args[0] === 'notify') {
            as = args.shift();
        }
        rs = args.shift();
        if (typeof args[0] !== 'function') {
            os = args.shift();
        }
        hn = args.shift();

        notificationSubscribers[nextNotificationIndex] = {
            actionSpec: as,
            resourceSpec: rs,
            operation: os,
            handler: hn
        };

        nextNotificationIndex++;
        return nextNotificationIndex - 1;  //  index of the new subscriber
    },

    /**
     * Created by Tim (help from Bill) 2021-06-08
     * Turn off the notification at the given index.
     *
     * Note: really `codapInterface` should have `on()` supply a `latestIndex` and have this routine
     * "off" it. Then any notification loops should skip the nulls.
     *
     * @param iSubscriberIndex
     */
    off: function(iSubscriberIndex) {
        notificationSubscribers[iSubscriberIndex] = null;
        // notificationSubscribers.splice(iSubscriberIndex,1);
    },

    /**
     * Parses a resource selector returning a hash of named resource names to
     * resource values. The last clause is identified as the resource type.
     * E.g. converts 'dataContext[abc].collection[def].case'
     * to {dataContext: 'abc', collection: 'def', type: 'case'}
     *
     * @param {String} iResource
     * @return {Object}
     */
    parseResourceSelector: function (iResource) {
        var selectorRE = /([A-Za-z0-9_-]+)\[([^\]]+)]/;
        var result = {};
        var selectors = iResource.split('.');
        selectors.forEach(function (selector) {
            var resourceType, resourceName;
            var match = selectorRE.exec(selector);
            if (selectorRE.test(selector)) {
                resourceType = match[1];
                resourceName = match[2];
                result[resourceType] = resourceName;
                result.type = resourceType;
            } else {
                result.type = selector;
            }
        });

        return result;
    }
};