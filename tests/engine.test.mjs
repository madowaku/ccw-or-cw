import test from 'node:test';
import assert from 'node:assert/strict';
import {stages} from '../stages.mjs';
import {initialState,step,solve,validateStage,normalize} from '../engine.mjs';
test('angles normalize',()=>{assert.equal(normalize(-1),15);assert.equal(normalize(17),1);});
test('all stages solve in exactly the specified minimal number of moves',()=>{
 for(const s of stages){
  validateStage(s);
  const optimal=solve(s);
  assert.equal(optimal.moves,s.expected,s.id);
  assert.ok(optimal.paths.some(p=>JSON.stringify(p)===JSON.stringify(s.answer)),s.id);
  let state=initialState(s);
  for(const dir of s.answer)state=step(s,state,dir);
  assert.equal(state.status,'won',s.id);
 }
});
test('stage 002 cascades automatically through two walls',()=>{
 const s=step(stages[1],initialState(stages[1]),-1);
 assert.deepEqual(s.transition.crossed,[0,1]);assert.equal(s.status,'won');
});
test('stage 009 short early tunnel is a trap',()=>{
 const stage=stages[8],bait=step(stage,initialState(stage),-1);
 assert.deepEqual(bait.transition.crossed,[0,1,2]);
 for(const dir of [-1,1])assert.notEqual(step(stage,bait,dir).status,'won');
});
test('completed state is immutable after additional input',()=>{
 const won=step(stages[0],initialState(stages[0]),1);
 assert.equal(step(stages[0],won,1),won);
});
test('invalid input is rejected',()=>{
 assert.throws(()=>validateStage({walls:[[]]}));
 assert.throws(()=>validateStage({walls:[[16]]}));
 assert.throws(()=>step(stages[0],initialState(stages[0]),0));
});
for(const stage of stages)test('stage '+stage.id+' shortest route',()=>{
 const result=solve(stage);
 assert.equal(result.moves,stage.expected);
 assert.ok(result.paths.length>0);
});
