(function (root, YDomMutationObserver) {
    if (typeof define === 'function' && define.amd) {
        /**
         * AMD. Register as an anonymous module unless amdModuleId is set
         */
        define(["jquery"], function (a0) {
            return (YDomMutationObserver(a0));
        });
    } else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        /**
         * Pass this to node modules when this is the server
         *
         * @type {DomMutationObserver}
         */
        module.exports = YDomMutationObserver(require("jquery"));
    } else {
        /**
         * Pass this if window is defined
         *
         * @type {DomMutationObserver}
         */
        window.YDomMutationObserver = YDomMutationObserver(window.jQuery);
    }
}(this, function (jQuery) {
    "use strict";

    /**
     * @typedef {Object} DomMutationObserver
     * This component needs to handle dom changes and listen to dom changes without killing browser performance
     * if this not supported we fall back to simple setInterval action
     */

    /**
     * Construct a new DomMutationObserver
     *
     * @class DomMutationObserver
     * @classdesc Wrapper over MutationObserver.
     * simple event listener for dom changes or the attached dom
     *
     * @namespace DomMutationObserver
     * @constructor
     */
    var DomMutationObserver = function () {
        var self = this;

        /**
         * Node for which observing DOM mutation.
         *
         * @name DomMutationObserver#node
         * @type Node
         */
        var node;

        /**
         * DOM mutations observer.
         *
         * @name DomMutationObserver#mutationObserver
         * @type MutationObserver
         */
        var mutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

        /**
         * observer.
         *
         * @name DomMutationObserver#observer
         * @type MutationObserver
         */
        var observer;

        /**
         * setInterval when the MutationObserver not available
         *
         * @name DomMutationObserver#intervalHandle
         * @type setInterval
         */
        var intervalHandle;

        /**
         * events handlers
         *
         * @name DomMutationObserver#handlers
         * @type Object
         */
        var handlers = {};

        /**
         * events handlers Name
         *
         * @name DomMutationObserver#handlersName
         * @type Array
         */
        var handlersName = [];

        for (var i in DomMutationObserver.EVENTS) {
            handlersName.push(DomMutationObserver.EVENTS[i]);
        }

        /**
         * @description
         * These options the default for 'mutationObserver' not using all of them, you can pass one of them on init method
         * @options
         * @param {boolean} childList
         * @param {boolean} attributes
         * @param {boolean} characterData
         * @param {boolean} subtree
         * @param {boolean} attributeOldValue
         * @param {boolean} characterDataOldValue
         * @param {Array} attributeFilter
         */
        var options = {
            attributes: true,
            characterData: true,
            childList: true,
            subtree: true,
            attributeOldValue: true,
            characterDataOldValue: true
        };

        /**
         * private function to handle changes on dom
         *
         * @memberof DomMutationObserver#
         * @method defaultCallback
         * @param {Array} records
         */
        var defaultCallback = function (records) {
            if (records && Array.isArray(records)) {
                var triggeredEvents = {};

                records.forEach(function (record) {
                    if (
                        record &&
                        record.type
                    ) {
                        triggeredEvents[record.type] = triggeredEvents[record.type] || [];
                        triggeredEvents[record.type].push(record);
                    }
                });

                Object.keys(triggeredEvents).forEach(function (record) {
                    switch (record) {
                        case 'attributes':
                            if (handlers[YDomMutationObserver.EVENTS.ON_ATTRIBUTES_CHANGED]) {
                                self.trigger('on-attributes-changed', triggeredEvents[record]);
                            }

                            break;

                        case 'characterData':
                            if (handlers[YDomMutationObserver.EVENTS.ON_CHARACTER_DATA_CHANGED]) {
                                self.trigger('on-character-data-changed', triggeredEvents[record]);
                            }

                            break;

                        case 'childList':
                            if (handlers[YDomMutationObserver.EVENTS.ON_CHILD_LIST_CHANGED]) {
                                self.trigger('on-child-list-changed', triggeredEvents[record]);
                            }

                            break;

                        case 'subtree':
                            if (handlers[YDomMutationObserver.EVENTS.ON_SUBTREE_CHANGED]) {
                                self.trigger('on-subtree-changed', triggeredEvents[record]);
                            }

                            break;

                        case 'attributeOldValue':
                            if (handlers[YDomMutationObserver.EVENTS.ON_ATTRIBUTE_OLD_VALUE]) {
                                self.trigger('on-attribute-old-value', triggeredEvents[record]);
                            }

                            break;

                        case 'characterDataOldValue':
                            if (handlers[YDomMutationObserver.EVENTS.ON_CHARACTER_DATA_OLD_VALUE]) {
                                self.trigger('on-character-data-old-value', triggeredEvents[record]);
                            }

                            break;
                    }
                });
            } else {
                self.trigger('on-change', []);
            }
        };

        /**
         * Call startListening when you are ready to start handler events
         *
         * Note: At the very least, childList or attributes or characterData must be set to true.
         * Otherwise, "An invalid or illegal string was specified" error is thrown.
         *
         * @memberof DomMutationObserver#
         * @method startListening
         * @param {Node, jQuery} attachedNode - the node you need to listen to dom changes
         * @param {Object} passedOptions - these options for the mutationObserver for now these not working when the mutationObserver not defined
         */
        self.init = function (attachedNode, passedOptions) {
            if (!attachedNode) {
                throw new Error('No javascript dom element send to watch changes', Date.now());
            }

            if (attachedNode instanceof jQuery) {
                attachedNode = attachedNode[0];
            }

            if (passedOptions) {
                options = jQuery.extend({}, options, passedOptions);
            }

            node = attachedNode;

            if (!mutationObserver) {
                observer = {
                    id: 'IS_INTERVAL',
                    callback: defaultCallback
                };
            } else {
                observer = new mutationObserver(defaultCallback);
            }
        };

        /**
         * Events attached when listen to dom changes
         * on-change event trigger when the browser dose't support the mutationObserver
         * @memberof DomMutationObserver#
         * @method on
         * @param {String} type
         * @param {Function[]} handler
         */
        self.on = function (type, handler) {
            if (handlersName.indexOf(type) === -1) {
                throw new Error('Type must be one of these ' + JSON.stringify(handlersName), Date.now());
            }

            if (type === DomMutationObserver.EVENTS.ON_ATTRIBUTES_CHANGED && !options['attributes']) {
                throw new Error('You can\'t use on-attributes-changed event when attributes listener as false' , Date.now());
            }

            if (type === DomMutationObserver.EVENTS.ON_CHARACTER_DATA_CHANGED && !options['characterData']) {
                throw new Error('You can\'t use on-character-data-changed event when characterData listener as false' , Date.now());
            }

            if (type === DomMutationObserver.EVENTS.ON_CHILD_LIST_CHANGED && !options['childList']) {
                throw new Error('You can\'t use on-child-list-changed event when childList listener as false' , Date.now());
            }

            if (type === DomMutationObserver.EVENTS.ON_SUBTREE_CHANGED && !options['subtree']) {
                throw new Error('You can\'t use on-subtree-changed event when subtree listener as false' , Date.now());
            }

            if (type === DomMutationObserver.EVENTS.ON_ATTRIBUTE_OLD_VALUE && !options['attributeOldValue']) {
                throw new Error('You can\'t use on-attribute-old-value event when attributeOldValue listener as false' , Date.now());
            }

            if (type === DomMutationObserver.EVENTS.ON_CHARACTER_DATA_OLD_VALUE && !options['characterDataOldValue']) {
                throw new Error('You can\'t use on-character-data-old-value event when characterDataOldValue listener as false' , Date.now());
            }

            handlers[type] = handlers[type] || [];
            handlers[type].push(handler);

            return handlers[type];
        };

        /**
         * async trigger any event attached to this dom but this manual trigger not a browser trigger
         * the first params will always be an empty array or array of Mutation Records
         *
         * @memberof DomMutationObserver#
         * @method trigger
         * @param {String} type
         */
        self.trigger = function (type) {
            if (!type || handlersName.indexOf(type) === -1) {
                throw new Error('This event not valid' , Date.now());
            }

            // get params from function as infinite params fix
            var params = Array.from(arguments);
            params.splice(0, 1);

            // push an empty array if the first params not MutationRecord
            if (
                !Array.isArray(params[0]) || (Array.isArray(params[0]) && !params[0][0] instanceof MutationRecord)
            ) {
                params.unshift([]);
            }

            /**
             * trigger the events with new params
             *
             * @param {function} handler
             */
            handlers[type].forEach(function (handler) {
                setTimeout(function () {
                    /**
                     * @type function
                     */
                    handler.apply(null, params);
                }, 1);
            });
        };

        /**
         * sync trigger any event attached to this dom but this manual trigger not a browser trigger
         *
         * @memberof DomMutationObserver#
         * @method trigger
         * @param {String} type
         */
        self.syncTrigger = function (type) {
            if (!type || handlersName.indexOf(type) === -1) {
                throw new Error('This event not valid' , Date.now());
            }

            // get params from function as infinite params fix
            var params = Array.from(arguments);
            params.splice(0, 1);

            // push an empty array if the first params not MutationRecord
            if (
                !Array.isArray(params[0]) || (Array.isArray(params[0]) && !params[0][0] instanceof MutationRecord)
            ) {
                params.unshift([]);
            }

            /**
             * trigger the events with new params
             *
             * @param {function} handler
             */
            handlers[type].forEach(function (handler) {
                /**
                 * @type function
                 */
                handler.apply(null, params);
            });
        };

        /**
         * Call startListening when you are ready to start handler events
         *
         * @memberof DomMutationObserver#
         * @method startListening
         * @param {Number} interval
         */
        self.startListening = function (interval) {
            if (!handlers[DomMutationObserver.EVENTS.ON_CHANGE]) {
                throw new Error('On Change event for this component is a required handler', Date.now());
            }

            if (!mutationObserver) {
                intervalHandle = setInterval(observer.callback, (typeof (interval) === 'undefined') ? 500 : interval);
            } else {
                observer.observe(node, options);
            }
        };

        /**
         * get the node attached as simple Dom object
         *
         * @memberof DomMutationObserver#
         * @method getNode
         */
        self.getNode = function () {
            return node;
        };

        /**
         * destroy
         *
         * @memberof DomMutationObserver#
         * @method destroy
         */
        self.destroy = function () {

            // stop observing
            if (mutationObserver) {
                clearInterval(intervalHandle);
            } else {
                observer.disconnect();
            }

            options = {
                attributes: true,
                childList: true,
                characterData: true,
                subtree: true
            };

            observer = null;
            node = null;
        };
    };

    /**
     * Define events for this component
     * @type {Object}
     */
    DomMutationObserver.EVENTS = {};
    DomMutationObserver.EVENTS.ON_ATTRIBUTES_CHANGED = 'on-attributes-changed';
    DomMutationObserver.EVENTS.ON_CHARACTER_DATA_CHANGED = 'on-character-data-changed';
    DomMutationObserver.EVENTS.ON_CHILD_LIST_CHANGED = 'on-child-list-changed';
    DomMutationObserver.EVENTS.ON_SUBTREE_CHANGED = 'on-subtree-changed';
    DomMutationObserver.EVENTS.ON_ATTRIBUTE_OLD_VALUE = 'on-attribute-old-value';
    DomMutationObserver.EVENTS.ON_CHARACTER_DATA_OLD_VALUE = 'on-character-data-old-value';
    DomMutationObserver.EVENTS.ON_CHANGE = 'on-change';

    /**
     * Pass this object to node server if defined or pass to window to use it on client side
     * @type {DomMutationObserver}
     */
    return DomMutationObserver;
}));