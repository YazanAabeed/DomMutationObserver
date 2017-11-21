# DomMutationObserver
Simple wrapper for MutationObserver. MutationObserver needs to handle DOM changes and listen to DOM changes without killing browser performance if this not supported we fall back to simple setInterval action


### Supported MutationObserver attributes and every event for these attributes:
* **childList**: Set this to true if the element list changed and triggered with appended element.
* **subtree**: Set this to true to listen to every children inside this element.
* **attributes**: Set this to true if you need to listen to attributes changes.
* **attributeOldValue**: Get and store value for changed attributes
* **characterDataOldValue**: Get and store value for changed char data


### How to use
You can include it on your project and every time you need to define a new instance from it.
You can pass your own options and events on init function

```js
var domEventChangesListener = new YDomMutationObserver();

var domEventOptions = {
      attributes: false,
      characterData: true,
      childList: true,
      subtree: true,
      attributeOldValue: false,
      characterDataOldValue: false
};

domEventChangesListener.init(element[0] || jQuery, domEventOptions);
domEventChangesListener.on(YDomMutationObserver.EVENTS.ON_CHARACTER_DATA_CHANGED, domChanged);
domEventChangesListener.on(YDomMutationObserver.EVENTS.ON_CHILD_LIST_CHANGED, domChanged);
domEventChangesListener.on(YDomMutationObserver.EVENTS.ON_CHANGE, harriCallbacks.domChanged)
```

After that you start listen or observe the changes on your dom.
```js
domEventChangesListener.startListening(500);
```

To trigger any function manually use the trigger as async call or syncTrigger as sync call function
No need to send the record every time if you don't have it you can leave it.

```js
self.trigger('on-attributes-changed', record);
```

Or

```js
self.syncTrigger('on-attributes-changed', record);

```

### Events
You can use the 'on' function that pass the event name with callback to trigger when DOM changed or you triggered by you self.

* **on-attributes-changed** Trigger after the attributes changed with the whole changed object.
* **on-character-data-changed** Trigger when char data for this dom changed.
* **on-child-list-changed** Trigger when any child list for this dom changed.
* **on-subtree-changed** Trigger when children on this dom modified or changed.
* **on-change** Trigger for non-support browsers you need to pass it every time to handle default behavior.


### For not supported browsers
Trigger the on-change event that triggered by default when the browser not support this


### Compatibility
I have tested this on work for [HARRI](https://harri.com/) project for auto complete fields that shows a pop list with names to tag them.
