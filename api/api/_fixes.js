// api/_fixes.js - shared fixes for voice + fix + burmese
import fs from 'fs';
const FILE = '/tmp/nqai_fixes.json';

export function loadFixes(){
  try{
    if(fs.existsSync(FILE)){
      return JSON.parse(fs.readFileSync(FILE,'utf8'));
    }
  }catch(e){}
  return {};
}
export function saveFixes(data){
  try{
    fs.writeFileSync(FILE, JSON.stringify(data));
  }catch(e){ console.log("save err", e.message); }
}
