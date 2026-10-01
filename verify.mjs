import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
// Uses the installed, local Chrome only. No npm packages or external requests.
const targets=await(await fetch('http://127.0.0.1:9233/json')).json();
const target=targets.find(t=>t.type==='page'&&t.url.includes('4187'));
assert(target,'Local preview tab exists');
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pending=new Map();const errors=[];
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id)}};
async function cdp(method,params={}){const result=await new Promise(r=>{const n=++id;pending.set(n,r);ws.send(JSON.stringify({id:n,method,params}))});if(result.error)throw Error(JSON.stringify(result.error));return result.result}
async function run(expression){const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value}
async function shot(name){await new Promise(r=>setTimeout(r,250));const s=await cdp('Page.captureScreenshot',{format:'png'});await fs.writeFile(name,Buffer.from(s.data,'base64'))}
await cdp('Runtime.enable');await cdp('Page.reload');await new Promise(r=>setTimeout(r,900));
assert(await run('!!window.Console3D && Console3D.meshCount>0'),'3D geometry initialized');
assert.equal(await run('Game.validate()'),'','Demo is reachable');
async function pressModel(key,hold=100){const point=await run(`Console3D.screenPoint('${key}')`);await cdp('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});await new Promise(r=>setTimeout(r,hold));return point}
async function releaseModel(point){await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1})}
// Hit the real projected mesh controls at the initial three-quarter angle.
let buttonPoint=await pressModel('Enter');assert.equal(await run('Game.mode'),'playing','3D Start begins game');assert((await run('Console3D.buttonTravel.Enter'))>.7,'Start visibly depresses');await releaseModel(buttonPoint);
buttonPoint=await pressModel('ArrowRight',460);assert((await run('Game.player'))>=20,'Holding physical D-pad repeats movement');await releaseModel(buttonPoint);const stoppedAt=await run('Game.player');await new Promise(r=>setTimeout(r,240));assert.equal(await run('Game.player'),stoppedAt,'Release stops movement');assert((await run('Console3D.buttonTravel.dpad'))<.05,'D-pad springs back');
buttonPoint=await pressModel('z');assert.equal(await run('Game.mode'),'paused','Physical B pauses');await releaseModel(buttonPoint);
buttonPoint=await pressModel('Enter');assert.equal(await run('Game.mode'),'playing','Physical Start resumes');await releaseModel(buttonPoint);
buttonPoint=await pressModel('x');assert.equal(await run('Game.player'),17,'Physical A restarts');assert((await run('Console3D.buttonTravel.x'))>.7,'A visibly depresses');await shot('preview-pressed.png');await releaseModel(buttonPoint);
buttonPoint=await pressModel('r');assert.equal(await run('Game.mode'),'ready','Select returns to title');await releaseModel(buttonPoint);
await run('Console3D.explode(true)');await new Promise(r=>setTimeout(r,1000));buttonPoint=await pressModel('Enter');assert.equal(await run('Game.mode'),'playing','Buttons remain aligned in exploded view');await releaseModel(buttonPoint);await run('Console3D.explode(false)');await new Promise(r=>setTimeout(r,1000));
await run("Console3D.view('back')");buttonPoint=await pressModel('Enter');assert.equal(await run('Game.mode'),'playing','Back of console does not activate hidden front controls');await releaseModel(buttonPoint);await run("Console3D.view('reset');Game.reset()");

await run(`document.querySelector('#customizeToggle').click()`);await new Promise(r=>setTimeout(r,300));assert.equal(await run("document.querySelector('#customizeToggle').getAttribute('aria-expanded')"),'true','Customize opens the side panel');assert.equal(await run("document.querySelector('#front').closest('aside')!==null && !document.querySelector('.axis')"),true,'View controls are in side panel and axis widget removed');await shot('preview-customize.png');
await run(`document.querySelector('#inspectComponents').click()`);await new Promise(r=>setTimeout(r,1200));assert.equal(await run('Console3D.inspection.groups.length'),9,'Nine separately modeled assemblies');assert((await run('Console3D.inspection.expanded'))>.8,'Component inspection expands assembly');assert.equal(await run('document.querySelector("#components").hidden'),false);await shot('preview-components.png');
await run(`document.querySelector('#componentList [data-part="display"]').click();document.querySelector('#isolateComponent').checked=true;document.querySelector('#isolateComponent').dispatchEvent(new Event('change'))`);assert.equal(await run('Console3D.inspection.selectedPart'),'display');assert.equal(await run('Console3D.inspection.isolated'),true);assert.match(await run('document.querySelector("#componentInfo").textContent'),/160 × 144/);await new Promise(r=>setTimeout(r,150));assert.equal(await run('document.querySelectorAll("#componentMarkers button:not([hidden])").length'),1,'Isolation hides other part markers');await shot('preview-component-isolated.png');
await run(`document.querySelector('#isolateComponent').checked=false;document.querySelector('#isolateComponent').dispatchEvent(new Event('change'));document.querySelector('#componentMarkers [data-part="pcb"]').click()`);assert.equal(await run('Console3D.inspection.selectedPart'),'pcb','Marker selects assembly');
await run(`document.querySelector('#separation').value='45';document.querySelector('#separation').dispatchEvent(new Event('input'))`);await new Promise(r=>setTimeout(r,1000));assert(Math.abs((await run('Console3D.inspection.expanded'))-.45)<.01,'Separation slider positions assemblies');
await run(`document.querySelector('#componentLabels').checked=false;document.querySelector('#componentLabels').dispatchEvent(new Event('change'))`);await new Promise(r=>setTimeout(r,100));assert.equal(await run('document.querySelector("#componentMarkers").hidden'),true);await run(`document.querySelector('#componentLabels').checked=true;document.querySelector('#componentLabels').dispatchEvent(new Event('change'));document.querySelector('#assembleComponents').click()`);await new Promise(r=>setTimeout(r,1000));assert((await run('Console3D.inspection.expanded'))<.01,'Reassemble restores geometry');assert.equal(await run('Console3D.inspection.isolated'),false);await run(`document.querySelector('[data-tab="design"]').click()`);

await run(`document.querySelector('[data-color="purple"]').click();document.querySelector('#buttonColor').value='#ffbb77';document.querySelector('#buttonColor').dispatchEvent(new Event('input'));document.querySelector('#back').click()`);
assert.equal(await run('Game.state.shell'),'purple');assert.equal(await run('Game.state.buttonColor'),'#ffbb77');await shot('preview-back.png');
await run(`document.querySelector('#makeGame').click();document.querySelector('#gameTitle').value='My Star World';document.querySelector('#gameTitle').dispatchEvent(new Event('input'));document.querySelector('#palette').value='purple';document.querySelector('#palette').dispatchEvent(new Event('change'));document.querySelector('#play').click()`);
assert.equal(await run('Game.mode'),'playing');
await run(`document.querySelector('#play').focus()`);
await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight'});
assert.equal(await run('Game.player'),18,'Keyboard moves player');
await run(`document.querySelector('[data-key="Escape"]').click()`);assert.equal(await run('Game.mode'),'paused');
await run(`document.querySelector('[data-key="Enter"]').click()`);assert.equal(await run('Game.mode'),'playing');
await shot('preview-editor.png');
// Exercise painting through a real pointer event, then restore the original tile.
const point=await run(`(()=>{const r=document.querySelector('#editor').getBoundingClientRect();return {x:r.left+r.width*5.5/16,y:r.top+r.height*1.5/12}})()`);
await run(`document.querySelector('[data-tile="2"]').click()`);
await cdp('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});assert.equal(await run('Game.state.tiles[21]'),2,'Pointer paints star');
await run(`document.querySelector('[data-tile="0"]').click()`);await cdp('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});assert.equal(await run('Game.state.tiles[21]'),0,'Pointer erases tile');
await run(`document.querySelector('#clear').click()`);assert.equal(await run('Game.state.tiles.filter(x=>x===2).length'),0);await run(`document.querySelector('#clear').click()`);assert.equal(await run('Game.state.tiles.filter(x=>x===2).length'),5,'Undo restores world');
await run(`document.querySelector('#save').click()`);await cdp('Page.reload');await new Promise(r=>setTimeout(r,650));assert.equal(await run('Game.state.title'),'My Star World');assert.equal(await run('Game.state.shell'),'purple');
await run(`document.querySelector('#projectData').value='{"version":1}';document.querySelector('#restore').click()`);assert.equal(await run('Game.state.title'),'My Star World','Malformed restore does not alter state');
// Play a complete original test map, including an exit blocked until a star is collected.
await run(`Game.state.tiles=Array(192).fill(1);Game.state.tiles[17]=3;Game.state.tiles[18]=4;Game.state.tiles[33]=2;Game.state.tiles[34]=0;Game.reset();Game.start();Game.key('ArrowRight')`);assert.equal(await run('Game.player'),17,'Exit locked before star');
for(const key of ['ArrowDown','ArrowRight','ArrowUp']){await new Promise(r=>setTimeout(r,140));await run(`Game.key('${key}')`)}assert.equal(await run('Game.mode'),'won','Collecting star then reaching exit wins');
await run(`Game.state.tiles[33]=1;Game.state.tiles[34]=1;Game.state.tiles[100]=2`);assert.match(await run('Game.validate()'),/Connect/,'Unreachable stars rejected');
await cdp('Page.reload');await new Promise(r=>setTimeout(r,600));
await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await new Promise(r=>setTimeout(r,300));assert.equal(await run('document.documentElement.scrollWidth<=innerWidth'),true,'Mobile layout does not overflow');
await run("Console3D.view('front');Game.reset()");await cdp('Emulation.setTouchEmulationEnabled',{enabled:true});
let touchPoint=await run("Console3D.screenPoint('Enter')");await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...touchPoint,id:0}]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await run('Game.mode'),'playing','Touch Start works on mobile');
touchPoint=await run("Console3D.screenPoint('ArrowRight')");await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...touchPoint,id:1}]});await new Promise(r=>setTimeout(r,400));await cdp('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});const afterCancel=await run('Game.player');assert(afterCancel>18,'Mobile hold repeats');await new Promise(r=>setTimeout(r,220));assert.equal(await run('Game.player'),afterCancel,'Touch cancellation releases held direction');
await cdp('Emulation.setTouchEmulationEnabled',{enabled:false});await shot('preview-mobile.png');await run("document.querySelector('#customizeToggle').click()");await new Promise(r=>setTimeout(r,280));assert.equal(await run('document.documentElement.scrollWidth<=innerWidth'),true,'Mobile side drawer fits viewport');await shot('preview-mobile-customize.png');await run(`document.querySelector('#inspectComponents').click();document.querySelector('#closeInspector').click()`);await new Promise(r=>setTimeout(r,1100));assert.equal(await run('document.querySelectorAll("#componentMarkers button").length'),9);assert(await run('Array.from(document.querySelectorAll("#componentMarkers button")).every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth})'),'Mobile component markers stay within viewport');await shot('preview-components-mobile.png');await run(`document.querySelector('#customizeToggle').click();document.querySelector('#assembleComponents').click()`);await run("document.querySelector('#closeInspector').click()");
await cdp('Emulation.clearDeviceMetricsOverride');
await run(`localStorage.removeItem('pocket-studio-v1')`);await cdp('Page.reload');await new Promise(r=>setTimeout(r,500));await shot('preview.png');
assert.deepEqual(errors,[],'No uncaught browser exceptions');
console.log('PASS: physical 3D buttons, press animation, D-pad hold/release, rotated and exploded hit testing, rear occlusion, WebGL initialization, customization, back view, editor, keyboard controls, pause/resume, undo, save/reload, restore validation, exit gating, full game victory, reachability validation, responsive layout, and zero browser exceptions.');
ws.close();
