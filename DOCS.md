## Classes

<dl>
<dt><a href="#LPF2">LPF2</a> ⇐ <code>EventEmitter</code></dt>
<dd></dd>
<dt><a href="#LPF2Hub">LPF2Hub</a> ⇐ <code><a href="#Hub">Hub</a></code></dt>
<dd></dd>
<dt><a href="#WeDo2Hub">WeDo2Hub</a> ⇐ <code><a href="#Hub">Hub</a></code></dt>
<dd></dd>
<dt><a href="#Hub">Hub</a> ⇐ <code>EventEmitter</code></dt>
<dd></dd>
</dl>

<a name="LPF2"></a>

## LPF2 ⇐ <code>EventEmitter</code>
**Kind**: global class  
**Extends**: <code>EventEmitter</code>  

* [LPF2](#LPF2) ⇐ <code>EventEmitter</code>
    * [.scan()](#LPF2+scan)
    * [.stop()](#LPF2+stop)
    * [.getConnectedDeviceByUUID(uuid)](#LPF2+getConnectedDeviceByUUID) ⇒ [<code>Hub</code>](#Hub) \| <code>null</code>
    * [.getConnectedDevices()](#LPF2+getConnectedDevices) ⇒ [<code>Array.&lt;Hub&gt;</code>](#Hub)
    * ["discover" (hub)](#LPF2+event_discover)

<a name="LPF2+scan"></a>

### lpF2.scan()
Begin scanning for LPF2 Hub devices.

**Kind**: instance method of [<code>LPF2</code>](#LPF2)  
<a name="LPF2+stop"></a>

### lpF2.stop()
Stop scanning for LPF2 Hub devices.

**Kind**: instance method of [<code>LPF2</code>](#LPF2)  
<a name="LPF2+getConnectedDeviceByUUID"></a>

### lpF2.getConnectedDeviceByUUID(uuid) ⇒ [<code>Hub</code>](#Hub) \| <code>null</code>
Retrieve a LPF2 Hub device by UUID.

**Kind**: instance method of [<code>LPF2</code>](#LPF2)  

| Param | Type |
| --- | --- |
| uuid | <code>string</code> | 

<a name="LPF2+getConnectedDevices"></a>

### lpF2.getConnectedDevices() ⇒ [<code>Array.&lt;Hub&gt;</code>](#Hub)
Retrieve a list of LPF2 Hub devices.

**Kind**: instance method of [<code>LPF2</code>](#LPF2)  
<a name="LPF2+event_discover"></a>

### "discover" (hub)
Emits when a LPF2 Hub device is found.

**Kind**: event emitted by [<code>LPF2</code>](#LPF2)  

| Param | Type |
| --- | --- |
| hub | [<code>WeDo2Hub</code>](#WeDo2Hub) \| [<code>LPF2Hub</code>](#LPF2Hub) | 

<a name="LPF2Hub"></a>

## LPF2Hub ⇐ [<code>Hub</code>](#Hub)
**Kind**: global class  
**Extends**: [<code>Hub</code>](#Hub)  

* [LPF2Hub](#LPF2Hub) ⇐ [<code>Hub</code>](#Hub)
    * [.setLEDColor(color)](#LPF2Hub+setLEDColor) ⇒ <code>Promise</code>
    * [.setMotorSpeed(port, speed, [time])](#LPF2Hub+setMotorSpeed) ⇒ <code>Promise</code>
    * [.setMotorAngle(port, angle, [speed])](#LPF2Hub+setMotorAngle) ⇒ <code>Promise</code>
    * [.connect()](#Hub+connect) ⇒ <code>Promise</code>
    * [.disconnect()](#Hub+disconnect) ⇒ <code>Promise</code>
    * [.subscribe(port, [mode])](#Hub+subscribe) ⇒ <code>Promise</code>
    * [.unsubscribe(port)](#Hub+unsubscribe) ⇒ <code>Promise</code>
    * [.sleep(delay)](#Hub+sleep) ⇒ <code>Promise</code>
    * [.wait(commands)](#Hub+wait) ⇒ <code>Promise</code>
    * ["button" (button, state)](#LPF2Hub+event_button)
    * ["distance" (port, distance)](#LPF2Hub+event_distance)
    * ["color" (port, color)](#LPF2Hub+event_color)
    * ["tilt" (port, x, y)](#LPF2Hub+event_tilt)
    * ["rotate" (port, rotation)](#LPF2Hub+event_rotate)

<a name="LPF2Hub+setLEDColor"></a>

### lpF2Hub.setLEDColor(color) ⇒ <code>Promise</code>
Set the color of the LED on the Hub via a color value.

**Kind**: instance method of [<code>LPF2Hub</code>](#LPF2Hub)  
**Returns**: <code>Promise</code> - Resolved upon successful issuance of command.  

| Param | Type | Description |
| --- | --- | --- |
| color | <code>number</code> | A number representing one of the LED color consts. |

<a name="LPF2Hub+setMotorSpeed"></a>

### lpF2Hub.setMotorSpeed(port, speed, [time]) ⇒ <code>Promise</code>
Set the motor speed on a given port.

**Kind**: instance method of [<code>LPF2Hub</code>](#LPF2Hub)  
**Returns**: <code>Promise</code> - Resolved upon successful completion of command. If time is specified, this is once the motor is finished.  

| Param | Type | Description |
| --- | --- | --- |
| port | <code>string</code> |  |
| speed | <code>number</code> | For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0. |
| [time] | <code>number</code> | How long to activate the motor for (in milliseconds). Leave empty to turn the motor on indefinitely. |

<a name="LPF2Hub+setMotorAngle"></a>

### lpF2Hub.setMotorAngle(port, angle, [speed]) ⇒ <code>Promise</code>
Rotate a motor by a given angle.

**Kind**: instance method of [<code>LPF2Hub</code>](#LPF2Hub)  
**Returns**: <code>Promise</code> - Resolved upon successful completion of command (ie. once the motor is finished).  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| port | <code>string</code> |  |  |
| angle | <code>number</code> |  | How much the motor should be rotated (in degrees). |
| [speed] | <code>number</code> | <code>100</code> | How fast the motor should be rotated. |

<a name="Hub+connect"></a>

### lpF2Hub.connect() ⇒ <code>Promise</code>
Connect to the Hub.

**Kind**: instance method of [<code>LPF2Hub</code>](#LPF2Hub)  
**Overrides**: [<code>connect</code>](#Hub+connect)  
**Returns**: <code>Promise</code> - Resolved upon successful connect.  
<a name="Hub+disconnect"></a>

### lpF2Hub.disconnect() ⇒ <code>Promise</code>
Disconnect the Hub.

**Kind**: instance method of [<code>LPF2Hub</code>](#LPF2Hub)  
**Returns**: <code>Promise</code> - Resolved upon successful disconnect.  
<a name="Hub+subscribe"></a>

### lpF2Hub.subscribe(port, [mode]) ⇒ <code>Promise</code>
Subscribe to sensor notifications on a given port.

**Kind**: instance method of [<code>LPF2Hub</code>](#LPF2Hub)  
**Returns**: <code>Promise</code> - Resolved upon successful issuance of command.  

| Param | Type | Description |
| --- | --- | --- |
| port | <code>string</code> |  |
| [mode] | <code>number</code> | The sensor mode to activate. If no mode is provided, the default for that sensor will be chosen. |

<a name="Hub+unsubscribe"></a>

### lpF2Hub.unsubscribe(port) ⇒ <code>Promise</code>
Unsubscribe to sensor notifications on a given port.

**Kind**: instance method of [<code>LPF2Hub</code>](#LPF2Hub)  
**Returns**: <code>Promise</code> - Resolved upon successful issuance of command.  

| Param | Type |
| --- | --- |
| port | <code>string</code> | 

<a name="Hub+sleep"></a>

### lpF2Hub.sleep(delay) ⇒ <code>Promise</code>
Sleep a given amount of time.

This is a helper method to make it easier to add delays into a chain of commands.

**Kind**: instance method of [<code>LPF2Hub</code>](#LPF2Hub)  
**Returns**: <code>Promise</code> - Resolved after the delay is finished.  

| Param | Type | Description |
| --- | --- | --- |
| delay | <code>number</code> | How long to sleep (in milliseconds). |

<a name="Hub+wait"></a>

### lpF2Hub.wait(commands) ⇒ <code>Promise</code>
Wait until a given list of concurrently running commands are complete.

This is a helper method to make it easier to wait for concurrent commands to complete.

**Kind**: instance method of [<code>LPF2Hub</code>](#LPF2Hub)  
**Returns**: <code>Promise</code> - Resolved after the commands are finished.  

| Param | Type | Description |
| --- | --- | --- |
| commands | <code>Array.&lt;Promise.&lt;any&gt;&gt;</code> | Array of executing commands. |

<a name="LPF2Hub+event_button"></a>

### "button" (button, state)
Emits when a button is pressed.

**Kind**: event emitted by [<code>LPF2Hub</code>](#LPF2Hub)  

| Param | Type | Description |
| --- | --- | --- |
| button | <code>string</code> |  |
| state | <code>number</code> | A number representing one of the button state consts. |

<a name="LPF2Hub+event_distance"></a>

### "distance" (port, distance)
Emits when a distance sensor is activated.

**Kind**: event emitted by [<code>LPF2Hub</code>](#LPF2Hub)  

| Param | Type | Description |
| --- | --- | --- |
| port | <code>string</code> |  |
| distance | <code>number</code> | Distance, in millimeters. |

<a name="LPF2Hub+event_color"></a>

### "color" (port, color)
Emits when a color sensor is activated.

**Kind**: event emitted by [<code>LPF2Hub</code>](#LPF2Hub)  

| Param | Type | Description |
| --- | --- | --- |
| port | <code>string</code> |  |
| color | <code>number</code> | A number representing one of the LED color consts. |

<a name="LPF2Hub+event_tilt"></a>

### "tilt" (port, x, y)
Emits when a tilt sensor is activated.

**Kind**: event emitted by [<code>LPF2Hub</code>](#LPF2Hub)  

| Param | Type | Description |
| --- | --- | --- |
| port | <code>string</code> | If the event is fired from the Move Hub's in-built tilt sensor, the special port "TILT" is used. |
| x | <code>number</code> |  |
| y | <code>number</code> |  |

<a name="LPF2Hub+event_rotate"></a>

### "rotate" (port, rotation)
Emits when a rotation sensor is activated.

**Kind**: event emitted by [<code>LPF2Hub</code>](#LPF2Hub)  

| Param | Type |
| --- | --- |
| port | <code>string</code> | 
| rotation | <code>number</code> | 

<a name="WeDo2Hub"></a>

## WeDo2Hub ⇐ [<code>Hub</code>](#Hub)
**Kind**: global class  
**Extends**: [<code>Hub</code>](#Hub)  

* [WeDo2Hub](#WeDo2Hub) ⇐ [<code>Hub</code>](#Hub)
    * [.setLEDColor(color)](#WeDo2Hub+setLEDColor) ⇒ <code>Promise</code>
    * [.setLEDRGB(red, green, blue)](#WeDo2Hub+setLEDRGB) ⇒ <code>Promise</code>
    * [.setMotorSpeed(port, speed)](#WeDo2Hub+setMotorSpeed) ⇒ <code>Promise</code>
    * [.connect()](#Hub+connect) ⇒ <code>Promise</code>
    * [.disconnect()](#Hub+disconnect) ⇒ <code>Promise</code>
    * [.subscribe(port, [mode])](#Hub+subscribe) ⇒ <code>Promise</code>
    * [.unsubscribe(port)](#Hub+unsubscribe) ⇒ <code>Promise</code>
    * [.sleep(delay)](#Hub+sleep) ⇒ <code>Promise</code>
    * [.wait(commands)](#Hub+wait) ⇒ <code>Promise</code>
    * ["button" (button, state)](#WeDo2Hub+event_button)
    * ["distance" (port, distance)](#WeDo2Hub+event_distance)
    * ["color" (port, color)](#WeDo2Hub+event_color)
    * ["tilt" (port, x, y)](#WeDo2Hub+event_tilt)
    * ["rotate" (port, rotation)](#WeDo2Hub+event_rotate)

<a name="WeDo2Hub+setLEDColor"></a>

### weDo2Hub.setLEDColor(color) ⇒ <code>Promise</code>
Set the color of the LED on the Hub via a color value.

**Kind**: instance method of [<code>WeDo2Hub</code>](#WeDo2Hub)  
**Returns**: <code>Promise</code> - Resolved upon successful issuance of command.  

| Param | Type | Description |
| --- | --- | --- |
| color | <code>number</code> | A number representing one of the LED color consts. |

<a name="WeDo2Hub+setLEDRGB"></a>

### weDo2Hub.setLEDRGB(red, green, blue) ⇒ <code>Promise</code>
Set the color of the LED on the Hub via RGB values.

**Kind**: instance method of [<code>WeDo2Hub</code>](#WeDo2Hub)  
**Returns**: <code>Promise</code> - Resolved upon successful issuance of command.  

| Param | Type |
| --- | --- |
| red | <code>number</code> | 
| green | <code>number</code> | 
| blue | <code>number</code> | 

<a name="WeDo2Hub+setMotorSpeed"></a>

### weDo2Hub.setMotorSpeed(port, speed) ⇒ <code>Promise</code>
Set the motor speed on a given port.

**Kind**: instance method of [<code>WeDo2Hub</code>](#WeDo2Hub)  
**Returns**: <code>Promise</code> - Resolved upon successful issuance of command.  

| Param | Type | Description |
| --- | --- | --- |
| port | <code>string</code> |  |
| speed | <code>number</code> | For forward, a value between 1 - 100 should be set. For reverse, a value between -1 to -100. Stop is 0. |

<a name="Hub+connect"></a>

### weDo2Hub.connect() ⇒ <code>Promise</code>
Connect to the Hub.

**Kind**: instance method of [<code>WeDo2Hub</code>](#WeDo2Hub)  
**Overrides**: [<code>connect</code>](#Hub+connect)  
**Returns**: <code>Promise</code> - Resolved upon successful connect.  
<a name="Hub+disconnect"></a>

### weDo2Hub.disconnect() ⇒ <code>Promise</code>
Disconnect the Hub.

**Kind**: instance method of [<code>WeDo2Hub</code>](#WeDo2Hub)  
**Returns**: <code>Promise</code> - Resolved upon successful disconnect.  
<a name="Hub+subscribe"></a>

### weDo2Hub.subscribe(port, [mode]) ⇒ <code>Promise</code>
Subscribe to sensor notifications on a given port.

**Kind**: instance method of [<code>WeDo2Hub</code>](#WeDo2Hub)  
**Returns**: <code>Promise</code> - Resolved upon successful issuance of command.  

| Param | Type | Description |
| --- | --- | --- |
| port | <code>string</code> |  |
| [mode] | <code>number</code> | The sensor mode to activate. If no mode is provided, the default for that sensor will be chosen. |

<a name="Hub+unsubscribe"></a>

### weDo2Hub.unsubscribe(port) ⇒ <code>Promise</code>
Unsubscribe to sensor notifications on a given port.

**Kind**: instance method of [<code>WeDo2Hub</code>](#WeDo2Hub)  
**Returns**: <code>Promise</code> - Resolved upon successful issuance of command.  

| Param | Type |
| --- | --- |
| port | <code>string</code> | 

<a name="Hub+sleep"></a>

### weDo2Hub.sleep(delay) ⇒ <code>Promise</code>
Sleep a given amount of time.

This is a helper method to make it easier to add delays into a chain of commands.

**Kind**: instance method of [<code>WeDo2Hub</code>](#WeDo2Hub)  
**Returns**: <code>Promise</code> - Resolved after the delay is finished.  

| Param | Type | Description |
| --- | --- | --- |
| delay | <code>number</code> | How long to sleep (in milliseconds). |

<a name="Hub+wait"></a>

### weDo2Hub.wait(commands) ⇒ <code>Promise</code>
Wait until a given list of concurrently running commands are complete.

This is a helper method to make it easier to wait for concurrent commands to complete.

**Kind**: instance method of [<code>WeDo2Hub</code>](#WeDo2Hub)  
**Returns**: <code>Promise</code> - Resolved after the commands are finished.  

| Param | Type | Description |
| --- | --- | --- |
| commands | <code>Array.&lt;Promise.&lt;any&gt;&gt;</code> | Array of executing commands. |

<a name="WeDo2Hub+event_button"></a>

### "button" (button, state)
Emits when a button is pressed.

**Kind**: event emitted by [<code>WeDo2Hub</code>](#WeDo2Hub)  

| Param | Type | Description |
| --- | --- | --- |
| button | <code>string</code> |  |
| state | <code>number</code> | A number representing one of the button state consts. |

<a name="WeDo2Hub+event_distance"></a>

### "distance" (port, distance)
Emits when a distance sensor is activated.

**Kind**: event emitted by [<code>WeDo2Hub</code>](#WeDo2Hub)  

| Param | Type | Description |
| --- | --- | --- |
| port | <code>string</code> |  |
| distance | <code>number</code> | Distance, in millimeters. |

<a name="WeDo2Hub+event_color"></a>

### "color" (port, color)
Emits when a color sensor is activated.

**Kind**: event emitted by [<code>WeDo2Hub</code>](#WeDo2Hub)  

| Param | Type | Description |
| --- | --- | --- |
| port | <code>string</code> |  |
| color | <code>number</code> | A number representing one of the LED color consts. |

<a name="WeDo2Hub+event_tilt"></a>

### "tilt" (port, x, y)
Emits when a tilt sensor is activated.

**Kind**: event emitted by [<code>WeDo2Hub</code>](#WeDo2Hub)  

| Param | Type |
| --- | --- |
| port | <code>string</code> | 
| x | <code>number</code> | 
| y | <code>number</code> | 

<a name="WeDo2Hub+event_rotate"></a>

### "rotate" (port, rotation)
Emits when a rotation sensor is activated.

**Kind**: event emitted by [<code>WeDo2Hub</code>](#WeDo2Hub)  

| Param | Type |
| --- | --- |
| port | <code>string</code> | 
| rotation | <code>number</code> | 

<a name="Hub"></a>

## Hub ⇐ <code>EventEmitter</code>
**Kind**: global class  
**Extends**: <code>EventEmitter</code>  

* [Hub](#Hub) ⇐ <code>EventEmitter</code>
    * [.connect()](#Hub+connect) ⇒ <code>Promise</code>
    * [.disconnect()](#Hub+disconnect) ⇒ <code>Promise</code>
    * [.subscribe(port, [mode])](#Hub+subscribe) ⇒ <code>Promise</code>
    * [.unsubscribe(port)](#Hub+unsubscribe) ⇒ <code>Promise</code>
    * [.sleep(delay)](#Hub+sleep) ⇒ <code>Promise</code>
    * [.wait(commands)](#Hub+wait) ⇒ <code>Promise</code>

<a name="Hub+connect"></a>

### hub.connect() ⇒ <code>Promise</code>
Connect to the Hub.

**Kind**: instance method of [<code>Hub</code>](#Hub)  
**Returns**: <code>Promise</code> - Resolved upon successful connect.  
<a name="Hub+disconnect"></a>

### hub.disconnect() ⇒ <code>Promise</code>
Disconnect the Hub.

**Kind**: instance method of [<code>Hub</code>](#Hub)  
**Returns**: <code>Promise</code> - Resolved upon successful disconnect.  
<a name="Hub+subscribe"></a>

### hub.subscribe(port, [mode]) ⇒ <code>Promise</code>
Subscribe to sensor notifications on a given port.

**Kind**: instance method of [<code>Hub</code>](#Hub)  
**Returns**: <code>Promise</code> - Resolved upon successful issuance of command.  

| Param | Type | Description |
| --- | --- | --- |
| port | <code>string</code> |  |
| [mode] | <code>number</code> | The sensor mode to activate. If no mode is provided, the default for that sensor will be chosen. |

<a name="Hub+unsubscribe"></a>

### hub.unsubscribe(port) ⇒ <code>Promise</code>
Unsubscribe to sensor notifications on a given port.

**Kind**: instance method of [<code>Hub</code>](#Hub)  
**Returns**: <code>Promise</code> - Resolved upon successful issuance of command.  

| Param | Type |
| --- | --- |
| port | <code>string</code> | 

<a name="Hub+sleep"></a>

### hub.sleep(delay) ⇒ <code>Promise</code>
Sleep a given amount of time.

This is a helper method to make it easier to add delays into a chain of commands.

**Kind**: instance method of [<code>Hub</code>](#Hub)  
**Returns**: <code>Promise</code> - Resolved after the delay is finished.  

| Param | Type | Description |
| --- | --- | --- |
| delay | <code>number</code> | How long to sleep (in milliseconds). |

<a name="Hub+wait"></a>

### hub.wait(commands) ⇒ <code>Promise</code>
Wait until a given list of concurrently running commands are complete.

This is a helper method to make it easier to wait for concurrent commands to complete.

**Kind**: instance method of [<code>Hub</code>](#Hub)  
**Returns**: <code>Promise</code> - Resolved after the commands are finished.  

| Param | Type | Description |
| --- | --- | --- |
| commands | <code>Array.&lt;Promise.&lt;any&gt;&gt;</code> | Array of executing commands. |

