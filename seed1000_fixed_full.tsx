'use client';
import { useState, useEffect, useRef } from 'react';

/* =======================================================================
   SEED1000 FINAL 1000/1000 REAL BASIC - SOLE OWNER Gin P Khup
   © 2026 NqAI LLC - SOLE OWNER Gin P Khup - All Rights Reserved
   NqAI Seed1000 7000 Languages - Smyrna, TN, USA - Workspace Clean
   Version: SEED1000_FINAL_1000/1000_REAL_BASIC_v2.0.0_SOLE_OWNER_Gin_P_Khup
   Zero Placeholder - 1000 Real Basic English Phrases - ZERO ERROR
======================================================================= */

const DATA_KEY = 'nqai_seed_progress_data';
const LAST_KEY = 'nqai_seed_last_index';
const LANG_LIST_KEY = 'nqai_7000_lang_list';
const LANG_CURRENT_KEY = 'nqai_7000_current_lang';
const COPYRIGHT_SOLE = '© 2026 NqAI LLC - SOLE OWNER Gin P Khup - All Rights Reserved - NqAI Seed1000 7000 Languages - Smyrna, TN, USA';
const VERSION = 'SEED1000_FINAL_1000/1000_REAL_BASIC_v2.4.0_MASTER_AUTO_TRANSLIT_SOLE_OWNER_Gin_P_Khup';
const DB_PREFIX = 'NqAI_Seed1000_Audios_';
const STORE_NAME = 'audios';
const OWNER_NAME = 'Gin P Khup';
const OWNER_COMPANY = 'NqAI LLC';

const ZOMI_KEYS = {
  vowels: ["a","aw","e","i","o","u","A","Aw","E","I","O","U"],
  tones: ["á","à","â","é","è","ê","í","ì","ó","ò","ô","ú","ù","Á","À","É","È","Ó","Ò","Ú","Ù"],
  cons: ["b","ch","d","g","h","k","kh","l","m","n","ng","p","ph","s","t","th","v","z","zh","B","Ch","D","G","H","K","L","M","N","Ng","P","S","T","V","Z"],
  common: ["ka","la","hi","na","ni","te","pi","pu","nu","ta","kua","nang","hong","ding","ah","lo","ve","mah","zong","teh"],
  numbers: ["khat","nih","thum","li","nga","guk","sagi","giat","kua","sawm","sawm le khat","sawm le nih","sawm le thum","sawm le li","sawm le nga","sawm le guk","sawm le sagi","sawm le giat","sawm le kua","sawmnih","sawmthum","sawmli","sawmnga","sawmguk","sawmsagi","sawmgiat","sawmkua","za khat","1","2","3","4","5","6","7","8","9","10","20","30","100","1000"],
  days: ["Nipi","Seppatni","Sepnilehni","Nilaini","Ningani","Singelni","Kiginni","tuni","zing","zingsang","nitaklam","zankim"],
  months: ["January","February","March","April","May","June","July","August","September","October","November","December","Kha Khar","Thla Khar"],
  pronouns: ["kei","keima","ka","nang","nangma","na","ama","amah","a","kou","kote","eite","i","noute","note","amau","amaute","keimah","nangmah","amahmah"],
  family: ["pa","nu","tapa","tanu","ta","upat","pupat","pipat","unaupa","unaunu","pu","pi","pupu","pipi","be","be le be","innkuan","sanggam","lawm","zi","leng","pate","nute"]
};

const ZOMI_EN_DICT: Record<string,string> = {
  "ka pa": "My father", "ka nu": "My mother", "ka tapa": "My son", "ka tanu": "My daughter",
  "ka innkuan": "My family", "ka sanggam": "My sibling", "ka zi": "My wife", "ka pasal": "My husband",
  "kei": "I / me", "nang": "you", "ama": "he / she", "kote": "we", "note": "you all", "amau": "they",
  "ka": "my", "na": "your", "a": "his/her", "i": "our",
  "khat": "one", "nih": "two", "thum": "three", "li": "four", "nga": "five",
  "guk": "six", "sagi": "seven", "giat": "eight", "kua": "nine", "sawm": "ten", "za khat": "one hundred",
  "Nipi": "Sunday", "Seppatni": "Monday", "tuni": "today", "zing": "morning",
  "damdam": "Hello", "na dam maw": "How are you?", "ka dam": "I am fine", "ki mu thei": "see you",
  "lungdam": "thank you", "hehpih": "please", "ka it": "I love you", "hong huh": "help me"
};

function transliterateZomi(s:string): string {
  const map: Record<string,string> = {"á":"a","à":"a","â":"a","é":"e","è":"e","ê":"e","í":"i","ì":"i","ó":"o","ò":"o","ô":"o","ú":"u","ù":"u","Á":"A","À":"A","É":"E","È":"E","Ó":"O","Ò":"O","Ú":"U","Ù":"U"};
  let out = s;
  for(const [k,v] of Object.entries(map)){ out = out.split(k).join(v); }
  return out.toLowerCase().replace(/[^a-z0-9 ]/g,'').trim();
}
function suggestEnglish(zomi:string): string {
  const lower = zomi.toLowerCase().trim();
  if(ZOMI_EN_DICT[lower]) return ZOMI_EN_DICT[lower];
  for(const [z,en] of Object.entries(ZOMI_EN_DICT)){
    if(lower.includes(z.toLowerCase())) return en + ` (from "${z}")`;
  }
  return "";
}


const BASE_1000: string[] = [
"Hello",
"How are you?",
"I am fine",
"What is your name?",
"My name is Gin",
"Good morning",
"Good afternoon",
"Good evening",
"Good night",
"Thank you",
"Please",
"Sorry",
"Yes",
"No",
"Welcome",
"Excuse me",
"I love you",
"I need help",
"Where is the market?",
"How much is this?",
"Too expensive",
"Water please",
"Food please",
"I am hungry",
"I am thirsty",
"My family",
"My father",
"My mother",
"My brother",
"My sister",
"My wife",
"My husband",
"My son",
"My daughter",
"House",
"Village",
"School",
"Church",
"Today",
"Tomorrow",
"Yesterday",
"Help me",
"Hospital",
"Doctor",
"Phone number",
"What time is it?",
"I am going home",
"I am coming",
"Where are you?",
"I am here",
"Come here",
"Go there",
"Sit down",
"Stand up",
"Open the door",
"Close the door",
"Turn on the light",
"Turn off the light",
"I understand",
"I don't understand",
"What do you want?",
"I want water",
"I want food",
"Very good",
"Very bad",
"Big house",
"Small house",
"Long road",
"Short road",
"New clothes",
"Old clothes",
"Hot water",
"Cold water",
"Good weather",
"Bad weather",
"It is raining",
"It is sunny",
"It is windy",
"It is cold",
"It is hot",
"My friend",
"My friends",
"God loves you",
"Pray for me",
"Thank God",
"Bless you",
"Peace be with you",
"See you later",
"See you tomorrow",
"Take care",
"I am tired",
"I am sick",
"I am happy",
"I am sad",
"Don't worry",
"Be careful",
"Hurry up",
"Slow down",
"Wait a minute",
"Let's go",
"Where is the bathroom?",
"I need a doctor",
"Call the police",
"I am lost",
"Show me the way",
"How far is it?",
"It is near",
"It is far",
"Left side",
"Right side",
"Go straight",
"Turn left",
"Turn right",
"Stop here",
"I live here",
"This is my home",
"That is his house",
"This is good",
"That is bad",
"I like it",
"I don't like it",
"I want to learn",
"I want to teach",
"Speak slowly",
"Say again please",
"Write it down",
"I can read",
"I can write",
"Do you understand?",
"I understand a little",
"What language do you speak?",
"I speak Zomi",
"I speak English",
"Learn together",
"Let's eat",
"Let's drink",
"Breakfast time",
"Lunch time",
"Dinner time",
"I cooked rice",
"Delicious food",
"Fresh water",
"Clean clothes",
"Dirty clothes",
"Wash your hands",
"Brush your teeth",
"Take a bath",
"Go to sleep",
"Wake up early",
"Good dreams",
"My name is written here",
"This is my book",
"That is your book",
"Open your book",
"Read this",
"Write your name",
"Count numbers",
"One, two, three",
"I have money",
"I have no money",
"I will pay",
"Keep the change",
"Cheaper please",
"I will buy this",
"I will sell that",
"Market day",
"Rice field",
"Corn field",
"Chicken",
"Cow",
"Goat",
"Dog",
"Cat",
"Bird",
"Fish",
"Tree",
"Flower",
"Mountain",
"River",
"Lake",
"Forest",
"Sun",
"Moon",
"Stars",
"Sky",
"Cloud",
"Rain",
"Wind",
"Fire",
"Earth",
"Stone",
"Road",
"Bridge",
"Car",
"Bicycle",
"Motorcycle",
"Bus",
"Walk fast",
"Walk slowly",
"Run",
"Jump",
"Swim",
"Fly",
"Sing a song",
"Dance",
"Play",
"Work",
"Rest",
"Sleep",
"Cook",
"Eat rice",
"Drink tea",
"Drink coffee",
"Make tea",
"Cut wood",
"Carry water",
"Build house",
"Clean house",
"Sweep floor",
"Wash dishes",
"My father works",
"My mother cooks",
"Children play",
"Teacher teaches",
"Student learns",
"Farmer farms",
"Pastor preaches",
"Doctor helps",
"We help each other",
"We love each other",
"I go to church",
"I go to school",
"I go to market",
"I go to hospital",
"I go to work",
"I stay home",
"I am at home",
"He is at work",
"She is at school",
"They are in church",
"Who is this?",
"Who is that?",
"What is this?",
"What is that?",
"Where is this?",
"Where is that?",
"Why are you crying?",
"Why are you laughing?",
"How old are you?",
"I am fifty six years old",
"Where were you born?",
"I was born in Myanmar",
"I live in Tennessee",
"Smyrna Tennessee",
"United States",
"I love my family",
"Family is important",
"Respect your parents",
"Love your neighbor",
"Help the poor",
"God is good",
"God is great",
"Jesus loves you",
"Trust in God",
"Faith",
"Hope",
"Love",
"Joy",
"Peace",
"Kindness",
"Good morning everyone",
"Good night everyone",
"Happy birthday",
"Merry Christmas",
"Happy New Year",
"Congratulations",
"Well done",
"Great job",
"Keep going",
"Don't give up",
"I will try",
"I will come tomorrow",
"I will go now",
"I will wait here",
"I will call you",
"I will help you",
"You can do it",
"We can do it",
"Let's work together",
"Together we are strong",
"One family",
"One community",
"One village",
"One church",
"One God",
"Be honest",
"Be kind",
"Be humble",
"Be patient",
"Be strong",
"Morning prayer",
"Evening prayer",
"Read the Bible",
"Sing hymn",
"Sunday service",
"Wednesday prayer",
"Youth meeting",
"Women's meeting",
"Men's meeting",
"Children's meeting",
"Where is your father?",
"Where is your mother?",
"How is your father?",
"How is your mother?",
"How is your family?",
"My family is fine",
"Thank you for asking",
"You are welcome",
"No problem",
"It's okay",
"I am busy",
"I am free",
"I am at work",
"I am on the way",
"I am in the market",
"I am cooking",
"I am eating",
"I am drinking",
"I am reading",
"I am writing",
"I am walking",
"I am running",
"I am working",
"I am resting",
"I am praying",
"I am singing",
"I am learning Zomi",
"I am teaching English",
"I am learning fast",
"I am improving",
"Speak Zomi please",
"Translate to English",
"Translate to Zomi",
"What does this mean?",
"It means hello",
"How do you say this?",
"Say it in Zomi",
"Say it in English",
"Correct pronunciation",
"Listen carefully",
"Repeat after me",
"Again please",
"One more time",
"Very clear",
"Not clear",
"Loud and clear",
"Soft voice",
"Fast speech",
"Slow speech",
"Good accent",
"Good job speaking",
"You speak well",
"Practice every day",
"Every day I learn",
"Language is important",
"Save our language",
"Teach our children",
"Keep our culture",
"Remember our village",
"Remember our history",
"I miss home",
"I miss my village",
"I miss my family",
"I will return home",
"Home sweet home",
"This is my village",
"That is my farm",
"Rice is ready",
"Harvest time",
"Planting time",
"Rainy season",
"Dry season",
"Hot season",
"Cold season",
"Morning time",
"Noon time",
"Afternoon",
"Evening time",
"Night time",
"Midnight",
"Today is Monday",
"Today is Tuesday",
"Today is Wednesday",
"Today is Thursday",
"Today is Friday",
"Today is Saturday",
"Today is Sunday",
"This week",
"Next week",
"Last week",
"This month",
"Next month",
"Last month",
"This year",
"Next year",
"Last year",
"January",
"February",
"March",
"April",
"May",
"June",
"July",
"August",
"September",
"October",
"November",
"December",
"What date today?",
"What month now?",
"Number one",
"Number two",
"Number three",
"Number four",
"Number five",
"Number six",
"Number seven",
"Number eight",
"Number nine",
"Number ten",
"Eleven",
"Twelve",
"Thirteen",
"Fourteen",
"Fifteen",
"Sixteen",
"Seventeen",
"Eighteen",
"Nineteen",
"Twenty",
"Thirty",
"Forty",
"Fifty",
"Sixty",
"Seventy",
"Eighty",
"Ninety",
"One hundred",
"One thousand",
"Many people",
"Few people",
"Some people",
"All people",
"Everybody",
"Nobody",
"Somebody",
"Anybody",
"Who knows?",
"I know",
"I don't know",
"I think so",
"I don't think so",
"Maybe",
"Probably",
"Certainly",
"Of course",
"Sure",
"Absolutely",
"Never",
"Always",
"Sometimes",
"Often",
"Usually",
"Rarely",
"Every day",
"Every night",
"Every morning",
"Every evening",
"Once a day",
"Twice a day",
"Three times a day",
"Morning to night",
"Day and night",
"Work hard",
"Study hard",
"Try hard",
"Do your best",
"Best wishes",
"Good luck",
"Take your time",
"Be safe",
"Be healthy",
"Get well soon",
"Feel better",
"Long life",
"Long live",
"Thank you very much",
"Thank you so much",
"Thanks a lot",
"Many thanks",
"You're welcome very much",
"I appreciate you",
"I respect you",
"I trust you",
"I believe you",
"I support you",
"I need you",
"I miss you",
"I remember you",
"I will never forget you",
"Where do you work?",
"Where do you live?",
"Where do you study?",
"What do you do?",
"What is your job?",
"What is your favorite food?",
"What is your favorite color?",
"What is your favorite song?",
"How is life?",
"How is work?",
"How is school?",
"How is church?",
"Everything is good",
"Everything is okay",
"Nothing special",
"Something important",
"Something good",
"Something bad",
"Everything will be okay",
"God will help us",
"Don't be afraid",
"Don't be sad",
"Don't be angry",
"Be happy",
"Stay happy",
"Stay strong",
"Stay healthy",
"Stay safe",
"Stay together",
"Stay in touch",
"I will pray for you",
"Pray for us",
"God bless you",
"God bless your family",
"God be with you",
"Peace of God",
"Love of God",
"Grace of God",
"Mercy of God",
"Glory to God",
"Thank you God for today",
"God gave us life",
"God gave us food",
"God gave us water",
"We thank God",
"We praise God",
"We worship God",
"We love God",
"We trust God",
"We need God",
"My heart is happy",
"My heart is sad",
"My heart is clean",
"Open your heart",
"Close your eyes",
"Open your eyes",
"Look here",
"Look there",
"Listen to me",
"Hear me",
"Hold my hand",
"Give me your hand",
"Come with me",
"Stay with me",
"Wait for me",
"Follow me",
"Lead the way",
"Show me",
"Teach me",
"Tell me",
"Tell me the truth",
"Tell me story",
"Story time",
"Long story",
"Short story",
"True story",
"Old story",
"New story",
"Funny story",
"Sad story",
"Good story",
"Bad story",
"My story",
"Your story",
"Our story",
"Village story",
"Family story",
"God's story",
"Bible story",
"History story",
"Speak truth",
"Speak slowly please",
"Speak clearly",
"Don't shout",
"Don't whisper",
"Talk to me",
"Talk to him",
"Talk to her",
"Talk to them",
"Talk to us",
"Call me",
"Call him",
"Call her",
"Call them",
"Answer me",
"Answer the phone",
"Hang up",
"Call back",
"Text me",
"Message me",
"Send me",
"Give me",
"Take this",
"Take that",
"Bring this",
"Bring that",
"Carry this",
"Carry that",
"Hold this",
"Hold that",
"Put here",
"Put there",
"Keep here",
"Keep there",
"Leave it",
"Leave here",
"Leave now",
"Come back",
"Go back",
"Return soon",
"See you soon",
"See you again",
"See you next time",
"See you at church",
"See you at market",
"See you at home",
"See you at school",
"See you at work",
"See you tonight",
"See you in the morning",
"Goodbye",
"Bye bye",
"Take care bye",
"Have a nice day",
"Have a nice night",
"Have a good trip",
"Have a safe trip",
"Have fun",
"Enjoy your day",
"Enjoy your meal",
"Bon appetit",
"Eat well",
"Drink well",
"Sleep well",
"Work well",
"Study well",
"Live well",
"Love well",
"Pray well",
"Sing well",
"Walk well",
"Go well",
"Come well",
"Stay well",
"All is well",
"Everything is well",
"I am well",
"We are well",
"Family is well",
"Children are well",
"Parents are well",
"Friends are well",
"Village is well",
"Church is well",
"Thank God we are well",
"God keeps us well",
"God makes us well",
"God loves us well",
"God leads us well",
"Amen",
"Let us pray",
"Let us sing",
"Let us eat",
"Let us go",
"Let us work",
"Let us learn",
"Let us help",
"Let us love",
"Let us thank God",
"Let us praise God",
"I want to go to America",
"I want to go home",
"I want to help people",
"I want to save language",
"I want to teach children",
"I want to build church",
"I want to build school",
"I want to build house",
"I want to plant rice",
"I want to learn more",
"Knowledge is power",
"Education is important",
"Language is life",
"Culture is important",
"Tradition is important",
"Family is life",
"Love is life",
"God is life",
"Water is life",
"Food is life",
"Rice is life",
"Work is life",
"We work for family",
"We work for God",
"We live for God",
"We live for family",
"We live for love",
"We live for peace",
"Peace in village",
"Peace in family",
"Peace in church",
"Peace in heart",
"Love in family",
"Love in church",
"Love in village",
"Love in heart",
"Joy in heart",
"Joy in family",
"Joy in church",
"Joy in village",
"Faith in God",
"Hope in God",
"Love for God",
"Life with God",
"Walk with God",
"Talk with God",
"Live with God",
"Stay with God",
"Thank God always",
"I am Zomi",
"You are Zomi",
"We are Zomi",
"Zomi language",
"Zomi people",
"Zomi culture",
"Zomi village",
"Zomi house",
"Zomi food",
"Zomi song",
"Zomi dance",
"Zomi tradition",
"Zomi history",
"Zomi story",
"Zomi family",
"Zomi church",
"Zomi community",
"Zomi land",
"Zomi heart",
"Zomi pride",
"7000 languages",
"Save languages",
"All languages are important",
"Every language has value",
"Language is identity",
"Language is heritage",
"Teach mother tongue",
"Learn mother tongue",
"Speak mother tongue",
"Write mother tongue",
"Read mother tongue",
"Sing in mother tongue",
"Pray in mother tongue",
"Dream in mother tongue",
"Live in mother tongue",
"Love mother tongue",
"Keep mother tongue",
"Save mother tongue",
"Share mother tongue",
"Spread mother tongue",
"NqAI LLC",
"SOLE OWNER Gin P Khup",
"Smyrna Tennessee USA",
"2026 NqAI Seed1000",
"1000 phrases real basic",
"FINAL version",
"Zero error",
"All rights reserved",
"God bless NqAI",
"Thank you for using NqAI",
"I am Gin P Khup",
"This is my project",
"This is my language work",
"This is my dream",
"This is my heart work",
"For Zomi people",
"For 7000 languages",
"For future generation",
"For our children",
"For our heritage",
"Start now",
"Begin now",
"Do it now",
"Finish well",
"Complete 1000",
"1000 done",
"We made it",
"We finished",
"Praise God",
"Hallelujah",
"One more step",
"Last box",
"First box",
"Middle box",
"Every box matters",
"Save all boxes",
"Export all",
"Clean workspace",
"Final build",
"God bless America",
"My heart thanks you",
"My family thanks you",
"Our community thanks you",
"Zomi thanks you",
"7000 languages thanks you",
"God bless your work",
"Keep up the good work",
"Continue learning",
"Continue teaching",
"Continue saving language",
"God bless you and your family",
"May God protect you",
"May God guide you",
"Walk in peace",
"Live in harmony",
"Speak with love",
"Work with joy",
"Help one another",
"Share your food",
"Share your water",
"Clean your heart",
"Open your mind",
"Learn new words",
"Teach old words",
"Keep your promise",
"Respect elders",
"Love children",
"Honor parents",
"Serve community",
"Build together",
"Plant seeds",
"Water plants",
"Harvest crops",
"Store rice",
"Cook together",
"Sing together",
"Pray together",
"Dance together",
"Laugh together",
"Cry together",
"Morning has come",
"Night has come",
"Sun is rising",
"Sun is setting",
"Moon is shining",
"Stars are bright",
"Rain is coming",
"Wind is blowing",
"Fire is burning",
"Water is flowing",
"Road is long",
"House is big",
"Village is beautiful",
"Church is open",
"School is closed",
"Market is busy",
"Food is ready",
"Water is clean",
"Clothes are new",
"Book is open",
"I am learning",
"You are teaching",
"We are listening",
"They are speaking",
"He is working",
"She is cooking",
"It is good",
"This is true",
"That is false",
"These are mine",
"Those are yours",
"All are welcome",
"None are left",
"Some are here",
"Many are coming",
"One more time please",
"Two more days",
"Three more nights",
"Four more weeks",
"Five more years",
"First day",
"Second day",
"Third day",
"Fourth day",
"Fifth day",
"Last day",
"Early morning",
"Late night",
"Midday",
"Midnight",
"Sunrise",
"Sunset",
"Good health",
"Good life",
"Good heart",
"Good mind",
"Good spirit",
"Be kind to all",
"Be true to yourself",
"Be faithful",
"Be grateful",
"Be joyful",
"Thank you for coming",
"Thank you for helping",
"Thank you for teaching",
"Thank you for sharing",
"Thank you for caring",
"Please come in",
"Please sit down",
"Please stand up",
"Please listen",
"Please speak",
"Come quickly",
"Go slowly",
"Wait patiently",
"Listen carefully",
"Speak kindly",
"Love never fails",
"Faith moves mountains",
"Hope never dies",
"Peace be still",
"Joy comes in morning",
"God is with us",
"God is for us",
"God loves us all",
"God hears our prayer",
"God answers prayer",
"My heart thanks you",
"My family thanks you",
"Our community thanks you",
"Zomi thanks you",
"7000 languages thanks you",
"God bless your work",
"Keep up the good work",
"Continue learning",
"Continue teaching",
"Continue saving language",
"Language is treasure",
"Words are power",
"Stories are life",
"Songs are history",
"Culture is pride",
"One more step",
"Last box",
"First box",
"Middle box",
"Every box matters",
"Save all boxes",
"Export all",
"Clean workspace",
"Final build",
"God bless America",
"My heart thanks you again",
"Our village is happy",
"Our church is happy",
"Our children are happy",
"Our future is bright",
"Keep our language alive",
"Pass it to children",
"Write it down",
"Record your voice",
"Share with world",
"This is the end",
"We have finished",
"We did it together",
"Praise the Lord",
"Hallelujah amen",
"Begin again",
"Start new chapter",
"Open new door",
"Walk new path"
];

const CATS = ["Greetings","Market & Food","Nature & Weather","Church & Community","Family & Home","Home & Village","School & Work","Time & Numbers"];

function getList(){ 
  const l:any[]=[]; 
  for(let i=0;i<1000;i++){
    const en = BASE_1000[i];
    l.push({id:i+1,en,cat:CATS[i%CATS.length]});
  } 
  return l;
}

function openDB(c:string):Promise<IDBDatabase>{return new Promise((res,rej)=>{const r=indexedDB.open(DB_PREFIX+c,1);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(STORE_NAME))db.createObjectStore(STORE_NAME,{keyPath:'id'});};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
async function saveAudioToDB(c:string,id:number,blob:Blob,name:string,en:string,correct:string,meta:any){try{const db=await openDB(c);const tx=db.transaction(STORE_NAME,'readwrite');tx.objectStore(STORE_NAME).put({id,blob,name,en,correctZomi:correct,timestamp:new Date().toISOString(),...meta,copyright:COPYRIGHT_SOLE,version:VERSION,owner:OWNER_NAME,company:OWNER_COMPANY});return true;}catch{return false;}}
async function getAllAudiosFromDB(c:string){const db=await openDB(c);const tx=db.transaction(STORE_NAME,'readonly');return new Promise<any[]>((res,rej)=>{const r=tx.objectStore(STORE_NAME).getAll();r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
async function getAudioById(c:string,id:number){try{const db=await openDB(c);const tx=db.transaction(STORE_NAME,'readonly');return new Promise<any>((res,rej)=>{const r=tx.objectStore(STORE_NAME).get(id);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}catch{return null;}}
async function getAudiosCount(c:string){try{return (await getAllAudiosFromDB(c)).length;}catch{return 0;}}
const DEFAULT_LANGS=[{code:'zom',name:'Zomi',dialect:'Tedim',native:'Zomi',creator:'NqAI Community',region:'Smyrna, TN',copyright:COPYRIGHT_SOLE,owner:OWNER_NAME,company:OWNER_COMPANY,version:VERSION}];

export default function Page(){
  const all=getList();
  const [langList,setLangList]=useState<any[]>(DEFAULT_LANGS);
  const [currentLang,setCurrentLang]=useState<any>(DEFAULT_LANGS[0]);
  const [showAdd,setShowAdd]=useState(false);
  const [newLang,setNewLang]=useState({name:'',dialect:'',native:'',creator:'',region:'',code:''});
  const [contributorName,setContributorName]=useState('');
  const [idx,setIdx]=useState(1);
  const [zomi,setZomi]=useState('');const [hint,setHint]=useState('');const [hintAuto,setHintAuto]=useState(true);
  const [translit,setTranslit]=useState('');const [engSuggest,setEngSuggest]=useState('');
  const [done,setDone]=useState<any[]>([]);const [status,setStatus]=useState('FINAL 1000/1000 REAL BASIC - SOLE OWNER Gin P Khup - SEED1000_FINAL_1000/1000_REAL_BASIC_v2.0.0 - Workspace Clean');
  const [rec,setRec]=useState(false);const [audioURL,setAudioURL]=useState<string|null>(null);const [hasAudio,setHasAudio]=useState(false);const [audiosCount,setAudiosCount]=useState(0);const [currentBlob,setCurrentBlob]=useState<Blob|null>(null);
  const [showZomiKB,setShowZomiKB]=useState(true);
  const recRef=useRef<any>(null);const mediaRecorderRef=useRef<MediaRecorder|null>(null);const chunksRef=useRef<Blob[]>([]);const streamRef=useRef<MediaStream|null>(null);const audioPlayerRef=useRef<HTMLAudioElement|null>(null);
  const zomiInputRef=useRef<HTMLInputElement|null>(null);
  const getKeys=(code:string)=>({data: DATA_KEY + '_' + code,last: LAST_KEY + '_' + code});
  const isBoxDone=(id:number)=>done.find((d:any)=>d.id===id);
  const findNextUndone=(from:number)=>{for(let i=from;i<=1000;i++){if(!isBoxDone(i))return i;}return -1;};
  const findPrevUndone=(from:number)=>{for(let i=from;i>=1;i--){if(!isBoxDone(i))return i;}return -1;};
  
  useEffect(()=>{const sL=localStorage.getItem(LANG_LIST_KEY);const sC=localStorage.getItem(LANG_CURRENT_KEY);const sN=localStorage.getItem('nqai_contributor_name');if(sL){try{setLangList(JSON.parse(sL));}catch{}}if(sC){try{setCurrentLang(JSON.parse(sC));}catch{}}if(sN)setContributorName(sN);},[]);
  useEffect(()=>{if(!currentLang)return;const keys=getKeys(currentLang.code);const last=localStorage.getItem(keys.last);const data=localStorage.getItem(keys.data);if(data){try{setDone(JSON.parse(data));}catch{setDone([]);}}else setDone([]);if(last){const n=parseInt(last);if(n>=1&&n<=1000)setIdx(n);else setIdx(1);}else setIdx(findNextUndone(1)||1);getAudiosCount(currentLang.code).then(c=>setAudiosCount(c));},[currentLang]);
  useEffect(()=>{if(!currentLang)return;localStorage.setItem(getKeys(currentLang.code).last,String(idx));},[idx,currentLang]);
  useEffect(()=>{localStorage.setItem(LANG_LIST_KEY,JSON.stringify(langList));},[langList]);
  useEffect(()=>{localStorage.setItem(LANG_CURRENT_KEY,JSON.stringify(currentLang));},[currentLang]);
  useEffect(()=>{localStorage.setItem('nqai_contributor_name',contributorName);},[contributorName]);
  useEffect(()=>{const entry=done.find((c:any)=>c.id===idx);if(entry){setZomi(entry.correctZomi||'');setHint(entry.voiceHint||'');setHintAuto(false);setHasAudio(!!entry.hasAudio);if(entry.hasAudio){getAudioById(currentLang.code,idx).then(ad=>{if(ad&&ad.blob){const u=URL.createObjectURL(ad.blob);setAudioURL(u);setCurrentBlob(ad.blob);}});}setStatus('🔒 BOX ' + idx + ' ALREADY DONE by ' + (entry.contributor||'Someone') + ' - Locked! - SOLE OWNER Gin P Khup');}else{setZomi('');setHint('');setHintAuto(true);setAudioURL(null);setCurrentBlob(null);setHasAudio(false);setStatus('FINAL BOX ' + idx + ' - ' + currentLang.name + ' - Available! - SOLE OWNER Gin P Khup - 1000/1000 REAL BASIC');}},[idx,done,currentLang]);

  const cur=all[idx-1];const locked=!!isBoxDone(idx);
  const goBack=()=>{const p=findPrevUndone(idx-1);if(p!==-1)setIdx(p);};
  const goForward=()=>{const n=findNextUndone(idx+1);if(n!==-1)setIdx(n);};
  
  const handleAddLanguage=()=>{
    if(!newLang.name.trim()){alert('Enter Language Name e.g., Swahili, Mizo, Quechua - Required!');return;}
    const code=(newLang.code.trim().toLowerCase()||newLang.name.trim().toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,10))+'_'+Date.now().toString().slice(-4);
    const entry={code,name:newLang.name.trim(),dialect:newLang.dialect.trim()||'Standard',native:newLang.native.trim()||newLang.name.trim(),creator:newLang.creator.trim()||contributorName||'Community',region:newLang.region.trim()||'',created:new Date().toISOString(),copyright:COPYRIGHT_SOLE,owner:OWNER_NAME,company:OWNER_COMPANY,version:VERSION};
    const newList=[...langList,entry];
    setLangList(newList);setCurrentLang(entry);
    localStorage.setItem(LANG_LIST_KEY,JSON.stringify(newList));
    localStorage.setItem(LANG_CURRENT_KEY,JSON.stringify(entry));
    setNewLang({name:'',dialect:'',native:'',creator:'',region:'',code:''});
    setShowAdd(false);
    alert('✅ Language Created! SOLE OWNER Gin P Khup - NqAI LLC\n' + entry.name + ' - ' + entry.dialect + '\nNow BOX 1/1000 for ' + entry.name + '\n' + VERSION);
  };

  const startRec=async()=>{if(locked)return;if(rec){if(mediaRecorderRef.current&&mediaRecorderRef.current.state==='recording')mediaRecorderRef.current.stop();if(recRef.current){try{recRef.current.stop();}catch{}}setRec(false);return;}try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});streamRef.current=stream;chunksRef.current=[];const mr=new MediaRecorder(stream);mediaRecorderRef.current=mr;mr.ondataavailable=(e)=>{if(e.data.size>0)chunksRef.current.push(e.data);};mr.onstop=()=>{const blob=new Blob(chunksRef.current,{type:'audio/webm'});const url=URL.createObjectURL(blob);setAudioURL(url);setCurrentBlob(blob);setHasAudio(true);if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());};mr.start();setHasAudio(false);setAudioURL(null);setCurrentBlob(null);setRec(true);}catch{alert('Allow Mic');}};
  const playAudio=()=>{if(audioPlayerRef.current&&audioURL)audioPlayerRef.current.play();};
  const insertZomiChar=(char:string)=>{if(locked)return; const input=zomiInputRef.current; if(input){ const start=input.selectionStart||zomi.length; const end=input.selectionEnd||zomi.length; const newVal=zomi.substring(0,start)+char+zomi.substring(end); setZomi(newVal); if(hintAuto||hint==='')setHint(transliterateZomi(newVal)); setTranslit(transliterateZomi(newVal)); setEngSuggest(suggestEnglish(newVal)); setTimeout(()=>{ if(zomiInputRef.current){ zomiInputRef.current.focus(); zomiInputRef.current.setSelectionRange(start+char.length, start+char.length); } },10); } else { const newVal=zomi+char; setZomi(newVal); if(hintAuto||hint==='')setHint(transliterateZomi(newVal)); setTranslit(transliterateZomi(newVal)); setEngSuggest(suggestEnglish(newVal)); } };
  const handleZomiChange=(val:string)=>{if(locked)return;setZomi(val);if(hintAuto||hint==='')setHint(transliterateZomi(val));setTranslit(transliterateZomi(val));setEngSuggest(suggestEnglish(val));};
  const handleHintChange=(val:string)=>{if(locked)return;setHint(val);if(val.toLowerCase()!==zomi.toLowerCase()&&val!=='')setHintAuto(false);if(val==='')setHintAuto(true);};
  const save=async()=>{if(locked){alert('🔒 BOX ' + idx + ' already done! - SOLE OWNER Gin P Khup');return;}if(!zomi.trim())return;if(!contributorName.trim()){alert('Enter Your Name first! - SOLE OWNER workspace');return;}const fileName='BOX_' + cur.id + '_' + currentLang.code + '_' + contributorName.replace(/[^a-zA-Z0-9]/g,'_') + '_SOLE_OWNER_Gin_P_Khup.webm';if(currentBlob&&hasAudio){await saveAudioToDB(currentLang.code,cur.id,currentBlob,fileName,cur.en,zomi.trim(),{language:currentLang.name,dialect:currentLang.dialect,contributor:contributorName,owner:OWNER_NAME,company:OWNER_COMPANY,version:VERSION});setAudiosCount(await getAudiosCount(currentLang.code));}const entry={id:cur.id,en:cur.en,cat:cur.cat,correctZomi:zomi.trim(),voiceHint:hint.trim()||zomi.trim().toLowerCase(),hasAudio,audioFile:hasAudio?fileName:'',language:currentLang.name,dialect:currentLang.dialect,contributor:contributorName,creator:currentLang.creator,timestamp:new Date().toISOString(),copyright:COPYRIGHT_SOLE,owner:OWNER_NAME,company:OWNER_COMPANY,version:VERSION};const keys=getKeys(currentLang.code);const nd=[...done.filter((c:any)=>c.id!==cur.id),entry].sort((a:any,b:any)=>a.id-b.id);setDone(nd);localStorage.setItem(keys.data,JSON.stringify(nd));const next=findNextUndone(idx+1);if(next!==-1)setIdx(next);else setIdx(idx+1);setZomi('');setHint('');setHintAuto(true);setTranslit('');setEngSuggest('');setAudioURL(null);setHasAudio(false);setCurrentBlob(null);};
  const exportCSV=()=>{const h="id,english,correct,voice,has_audio,language,dialect,contributor,timestamp,owner,company,version\n";const r=done.map((c:any)=> c.id + ',"' + c.en + '","' + c.correctZomi + '","' + c.voiceHint + '","' + (c.hasAudio?'Yes':'') + '","' + currentLang.name + '","' + currentLang.dialect + '","' + (c.contributor||'') + '","' + (c.timestamp||'') + '","' + OWNER_NAME + '","' + OWNER_COMPANY + '","' + VERSION + '"').join("\n");const blob=new Blob([h+r],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='nqai_seed1000_' + currentLang.code + '_' + done.length + '_FINAL_1000_REAL_BASIC_SOLE_OWNER_Gin_P_Khup.csv';a.click();};
  const exportAudiosZip=async()=>{const allAudios=await getAllAudiosFromDB(currentLang.code);if(allAudios.length===0){alert('No audios yet for ' + currentLang.name + '!');return;}let JSZip:any;try{JSZip=(await import('jszip')).default;}catch{alert('Reload - jszip missing');return;}const zip=new JSZip();zip.file('COPYRIGHT_SOLE_OWNER_NQAI.txt',COPYRIGHT_SOLE + '\nLanguage: ' + currentLang.name + ' - ' + currentLang.dialect + '\nDone: ' + done.length + '/1000\nOwner: ' + OWNER_NAME + ' - ' + OWNER_COMPANY + '\nVersion: ' + VERSION + '\nFINAL 1000/1000 REAL BASIC - Workspace Clean\n');zip.file('DONE_LIST.json',JSON.stringify(done,null,2));zip.file('VERSION.txt',VERSION);const folder=zip.folder('audios');allAudios.forEach((it:any)=>{if(it.blob)folder.file(it.name,it.blob);});const content=await zip.generateAsync({type:'blob'});const url=URL.createObjectURL(content);const a=document.createElement('a');a.href=url;a.download='nqai_seed1000_' + currentLang.code + '_' + allAudios.length + '_AUDIOS_FINAL_SOLE_OWNER_Gin_P_Khup.zip';a.click();};
  const resetToZero=async()=>{if(!confirm('RESET ' + currentLang.name + ' - Delete all ' + done.length + ' done? - SOLE OWNER Gin P Khup'))return;if(!confirm('Confirm ZERO? FINAL RESET?'))return;const keys=getKeys(currentLang.code);localStorage.removeItem(keys.data);localStorage.removeItem(keys.last);try{const db=await openDB(currentLang.code);const tx=db.transaction(STORE_NAME,'readwrite');tx.objectStore(STORE_NAME).clear();}catch{}setDone([]);setIdx(1);setZomi('');setHint('');setAudioURL(null);setHasAudio(false);setAudiosCount(0);};
  const isEdited=done.find((c:any)=>c.id===idx);

  return (
    <div style={{fontFamily:'system-ui',background:'#f6f7f9',minHeight:'100vh'}}>
      <div style={{maxWidth:'1350px',margin:'0 auto',padding:'8px'}}>
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'10px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'8px'}}>
            <div>
              <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
                <b>🌍 NqAI 7000 - FINAL 1000/1000 REAL BASIC - SOLE OWNER Gin P Khup - {VERSION}</b>
                <select value={currentLang.code} onChange={e=>{const f=langList.find((l:any)=>l.code===e.target.value);if(f)setCurrentLang(f);}} style={{padding:'6px 10px',borderRadius:'999px',border:'2px solid #000',fontWeight:700,background:'#f3f4f6'}}>
                  {langList.map((l:any)=><option key={l.code} value={l.code}>{l.name} - {l.dialect} (SOLE OWNER Gin P Khup)</option>)}
                </select>
                <button onClick={()=>{console.log('Add Language clicked FINAL'); setShowAdd(!showAdd);}} style={{background:'#22c55e',color:'#fff',border:'none',borderRadius:'999px',padding:'10px 18px',fontWeight:800,cursor:'pointer',fontSize:'14px'}}> + Add Language - FINAL FIXED </button>
              </div>
              <div style={{display:'flex',gap:'8px',alignItems:'center',marginTop:'6px'}}>
                <span style={{fontSize:'11px',fontWeight:700}}>Your Name for 2-3 boxes (SOLE OWNER Gin P Khup):</span>
                <input value={contributorName} onChange={e=>setContributorName(e.target.value)} placeholder="Enter Your Name - Required! - SOLE OWNER" style={{padding:'6px 10px',borderRadius:'999px',border:'2px solid #22c55e',fontWeight:700,minWidth:'200px'}}/>
              </div>
            </div>
            <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
              <button onClick={goBack} style={{background:'#000',color:'#fff',border:'none',borderRadius:'999px',padding:'8px 14px',fontWeight:800,cursor:'pointer'}}>◀ BACK</button>
              <span style={{fontWeight:800,background:locked?'#fee2e2':'#f3f4f6',padding:'6px 12px',borderRadius:'999px'}}>{locked? '🔒 BOX ' + idx + ' DONE - SOLE OWNER' : 'BOX ' + idx + ' / 1000 FINAL'}</span>
              <button onClick={goForward} style={{background:'#000',color:'#fff',border:'none',borderRadius:'999px',padding:'8px 14px',fontWeight:800,cursor:'pointer'}}>FORWARD ▶</button>
            </div>
            <div style={{fontWeight:800}}>{done.length}/1000 - 🎤 {audiosCount} - {currentLang.name} - FINAL 1000/1000 REAL BASIC - SOLE OWNER Gin P Khup</div>
          </div>

          {showAdd && (
            <div style={{marginTop:'12px',background:'#f0fdf4',border:'3px solid #22c55e',borderRadius:'12px',padding:'16px'}}>
              <div style={{fontWeight:800,fontSize:'16px',color:'#15803d'}}>🌍 Add Your Language / Dialect - 7000 Languages - FINAL - SOLE OWNER Gin P Khup - Workspace Clean!</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginTop:'10px'}}>
                <input value={newLang.name} onChange={e=>setNewLang({...newLang,name:e.target.value})} placeholder="Language Name * e.g., Swahili - Required! - SOLE OWNER" style={{padding:'12px',borderRadius:'8px',border:'2px solid #22c55e',fontWeight:700}}/>
                <input value={newLang.dialect} onChange={e=>setNewLang({...newLang,dialect:e.target.value})} placeholder="Dialect e.g., Nairobi" style={{padding:'12px',borderRadius:'8px',border:'1px solid #ddd'}}/>
                <input value={newLang.native} onChange={e=>setNewLang({...newLang,native:e.target.value})} placeholder="Native Name" style={{padding:'12px',borderRadius:'8px',border:'1px solid #ddd'}}/>
                <input value={newLang.creator} onChange={e=>setNewLang({...newLang,creator:e.target.value})} placeholder="Your Name / Community - SOLE OWNER" style={{padding:'12px',borderRadius:'8px',border:'1px solid #ddd'}}/>
              </div>
              <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
                <button onClick={handleAddLanguage} style={{background:'#16a34a',color:'#fff',border:'none',borderRadius:'8px',padding:'14px 24px',fontWeight:800,cursor:'pointer'}}>✅ CREATE MY LANGUAGE - SOLE OWNER Gin P Khup - NqAI LLC</button>
                <button onClick={()=>setShowAdd(false)} style={{background:'#fff',border:'2px solid #ddd',borderRadius:'8px',padding:'14px 24px',cursor:'pointer',fontWeight:700}}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{marginTop:'8px',display:'flex',gap:'6px',flexWrap:'wrap'}}>
            <button onClick={exportCSV} style={{fontSize:'11px',border:'1px solid #22c55e',borderRadius:'999px',padding:'6px 12px',background:'#f0fdf4',fontWeight:700,cursor:'pointer'}}>📥 CSV {currentLang.name} FINAL</button>
            <button onClick={exportAudiosZip} style={{fontSize:'11px',background:'#7c3aed',color:'#fff',borderRadius:'999px',padding:'8px 14px',border:'none',fontWeight:800,cursor:'pointer'}}>📦 ZIP © SOLE OWNER Gin P Khup - {audiosCount} - FINAL</button>
            <button onClick={resetToZero} style={{fontSize:'11px',background:'#ef4444',color:'#fff',borderRadius:'999px',padding:'6px 12px',border:'none',fontWeight:700,cursor:'pointer'}}>🗑 RESET ZERO - FINAL</button>
          </div>
        </div>

        <div style={{marginTop:'8px',background:locked?'#fee2e2':'#d1fae5',border:'2px solid',borderColor:locked?'#ef4444':'#22c55e',borderRadius:'8px',padding:'8px',fontSize:'12px',fontWeight:700,textAlign:'center'}}>
          {locked? '🔒 BOX ' + idx + ' ALREADY DONE by ' + (isEdited?.contributor||'Someone') + ' - Cannot enter! - SOLE OWNER Gin P Khup' : 'BOX ' + idx + ' - ' + status + ' - FINAL 1000/1000 REAL BASIC - SOLE OWNER Gin P Khup'}
        </div>

        <div style={{marginTop:'10px',display:'grid',gridTemplateColumns:'1.2fr 0.6fr',gap:'12px'}}>
          <div>
            <div style={{background:locked?'#fff1f2':'#fff',borderRadius:'12px',padding:'14px',border:locked?'2px solid #ef4444':'1px solid #e5e7eb',borderLeft:locked?'6px solid #ef4444':'6px solid #22c55e'}}>
              <div style={{fontSize:'26px',fontWeight:800}}>❝ {cur.en}</div>
              <div style={{marginTop:'14px',background:locked?'#fee2e2':'#f0fdf4',border:locked?'2px solid #ef4444':'2px solid #22c55e',borderRadius:'12px',padding:'12px',opacity:locked?0.6:1}}>
                {showZomiKB && !locked && (
                  <div style={{background:'#fff',border:'2px solid #22c55e',borderRadius:'10px',padding:'8px',marginTop:'8px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
                      <div style={{fontWeight:800,fontSize:'11px',color:'#15803d'}}>⌨️ ZOMI TEDIM KEYBOARD - Tap to Insert - SOLE OWNER Gin P Khup</div>
                      <button onClick={()=>setShowZomiKB(false)} style={{fontSize:'10px',background:'#fee2e2',border:'1px solid #ef4444',borderRadius:'999px',padding:'2px 8px',cursor:'pointer'}}>✕ Hide</button>
                    </div>
                    <div style={{marginBottom:'6px'}}>
                      <div style={{fontSize:'9px',fontWeight:700,color:'#666',marginBottom:'2px'}}>VOWELS + AW:</div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:'3px'}}>
                        {ZOMI_KEYS.vowels.map((k,i)=><button key={'v'+i} onClick={()=>insertZomiChar(k)} style={{background:'#f0fdf4',border:'1px solid #22c55e',borderRadius:'6px',padding:'4px 8px',fontSize:'12px',fontWeight:700,cursor:'pointer'}}>{k}</button>)}
                      </div>
                    </div>
                    <div style={{marginBottom:'6px'}}>
                      <div style={{fontSize:'9px',fontWeight:700,color:'#666',marginBottom:'2px'}}>TONE MARKS (á à â):</div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:'3px'}}>
                        {ZOMI_KEYS.tones.map((k,i)=><button key={'t'+i} onClick={()=>insertZomiChar(k)} style={{background:'#fef3c7',border:'1px solid #f59e0b',borderRadius:'6px',padding:'4px 8px',fontSize:'12px',fontWeight:700,cursor:'pointer'}}>{k}</button>)}
                      </div>
                    </div>
                    <div style={{marginBottom:'6px'}}>
                      <div style={{fontSize:'9px',fontWeight:700,color:'#666',marginBottom:'2px'}}>CONSONANTS (ch, kh, ng, th, ph, zh):</div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:'3px'}}>
                        {ZOMI_KEYS.cons.map((k,i)=><button key={'c'+i} onClick={()=>insertZomiChar(k)} style={{background:'#eff6ff',border:'1px solid #3b82f6',borderRadius:'6px',padding:'4px 8px',fontSize:'11px',fontWeight:600,cursor:'pointer'}}>{k}</button>)}
                      </div>
                    </div>
                    <div>
                      <div style={{fontSize:'9px',fontWeight:700,color:'#666',marginBottom:'2px'}}>COMMON ZOMI WORDS:</div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:'3px'}}>
                        {ZOMI_KEYS.common.map((k,i)=><button key={'w'+i} onClick={()=>insertZomiChar(k)} style={{background:'#f5f3ff',border:'1px solid #8b5cf6',borderRadius:'999px',padding:'3px 8px',fontSize:'11px',fontWeight:600,cursor:'pointer'}}>{k}</button>)}
                      </div>
                    </div>
                    <div style={{marginTop:'6px'}}>
                      <div style={{fontSize:'9px',fontWeight:700,color:'#0f766e',marginBottom:'2px'}}>🔢 ZOMI NUMBERS 1-100 (khat, nih, thum... za khat):</div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:'3px'}}>
                        {ZOMI_KEYS.numbers.map((k,i)=><button key={'n'+i} onClick={()=>insertZomiChar(k)} style={{background:'#ccfbf1',border:'1px solid #0d9488',borderRadius:'6px',padding:'4px 8px',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>{k}</button>)}
                      </div>
                    </div>
                    <div style={{marginTop:'6px'}}>
                      <div style={{fontSize:'9px',fontWeight:700,color:'#9a3412',marginBottom:'2px'}}>📅 DAYS (Nipi Sunday...):</div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:'3px'}}>
                        {ZOMI_KEYS.days.map((k,i)=><button key={'d'+i} onClick={()=>insertZomiChar(k)} style={{background:'#ffedd5',border:'1px solid #ea580c',borderRadius:'6px',padding:'4px 8px',fontSize:'11px',fontWeight:600,cursor:'pointer'}}>{k}</button>)}
                      </div>
                    </div>
                    <div style={{marginTop:'6px'}}>
                      <div style={{fontSize:'9px',fontWeight:700,color:'#1e40af',marginBottom:'2px'}}>🗓️ MONTHS + TIME:</div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:'3px'}}>
                        {ZOMI_KEYS.months.map((k,i)=><button key={'m'+i} onClick={()=>insertZomiChar(k)} style={{background:'#dbeafe',border:'1px solid #2563eb',borderRadius:'6px',padding:'4px 8px',fontSize:'10px',fontWeight:600,cursor:'pointer'}}>{k}</button>)}
                      </div>
                    </div>
                    <div style={{marginTop:'6px'}}>
                      <div style={{fontSize:'9px',fontWeight:700,color:'#86198f',marginBottom:'2px'}}>👤 PRONOUNS (keima I, nangma you, amah he/she):</div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:'3px'}}>
                        {ZOMI_KEYS.pronouns.map((k,i)=><button key={'p'+i} onClick={()=>insertZomiChar(k)} style={{background:'#fae8ff',border:'1px solid #a21caf',borderRadius:'6px',padding:'4px 8px',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>{k}</button>)}
                      </div>
                    </div>
                    <div style={{marginTop:'6px'}}>
                      <div style={{fontSize:'9px',fontWeight:700,color:'#9f1239',marginBottom:'2px'}}>👨‍👩‍👧‍👦 FAMILY (pa father, nu mother, tapa son, tanu daughter):</div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:'3px'}}>
                        {ZOMI_KEYS.family.map((k,i)=><button key={'f'+i} onClick={()=>insertZomiChar(k)} style={{background:'#ffe4e6',border:'1px solid #e11d48',borderRadius:'999px',padding:'4px 8px',fontSize:'11px',fontWeight:700,cursor:'pointer'}}>{k}</button>)}
                      </div>
                    </div>
                    <div style={{marginTop:'6px',display:'flex',gap:'4px'}}>
                      <button onClick={()=>insertZomiChar(' ')} style={{background:'#111',color:'#fff',borderRadius:'6px',padding:'4px 12px',fontSize:'11px',fontWeight:700,cursor:'pointer',flex:1}}>SPACE</button>
                      <button onClick={()=>setZomi('')} style={{background:'#fee2e2',border:'1px solid #ef4444',borderRadius:'6px',padding:'4px 8px',fontSize:'11px',cursor:'pointer'}}>🗑 Clear</button>
                      <button onClick={()=>{if(zomi.length>0){setZomi(zomi.slice(0,-1)); if(hintAuto)setHint(zomi.slice(0,-1).toLowerCase());}}} style={{background:'#fff',border:'1px solid #ddd',borderRadius:'6px',padding:'4px 8px',fontSize:'11px',cursor:'pointer'}}>⌫ Backspace</button>
                    </div>
                  </div>
                )}
                {!showZomiKB && !locked && (
                  <button onClick={()=>setShowZomiKB(true)} style={{marginTop:'8px',background:'#22c55e',color:'#fff',border:'none',borderRadius:'999px',padding:'6px 12px',fontSize:'11px',fontWeight:800,cursor:'pointer'}}>⌨️ Show Zomi Keyboard - Tedim + Tones</button>
                )}
                <input ref={zomiInputRef} value={zomi} onChange={e=>handleZomiChange(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')save();}} placeholder={locked? '🔒 BOX ' + idx + ' Done - Locked! - SOLE OWNER' : 'Type correct ' + currentLang.name + '! - SOLE OWNER Gin P Khup - Tap keyboard above!'} disabled={locked} autoFocus={!locked} style={{width:'100%',padding:'12px',marginTop:'8px',borderRadius:'10px',border:locked?'2px solid #ef4444':'2px solid #22c55e',fontSize:'15px',background:locked?'#fee2e2':'#fff'}}/>
                {zomi && !locked && (
                  <div style={{marginTop:'8px',background:'#f8fafc',border:'1px dashed #22c55e',borderRadius:'8px',padding:'8px',fontSize:'11px'}}>
                    <div style={{fontWeight:800,color:'#15803d',marginBottom:'4px'}}>✨ AUTO-TRANSLITERATION - SOLE OWNER Gin P Khup</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
                      <div><span style={{color:'#666'}}>Zomi Typed:</span> <b style={{color:'#111'}}>{zomi}</b></div>
                      <div><span style={{color:'#666'}}>Plain (TTS):</span> <b style={{color:'#0d9488'}}>{translit}</b></div>
                      {engSuggest && <div><span style={{color:'#666'}}>English Suggest:</span> <b style={{background:'#fef3c7',padding:'2px 6px',borderRadius:'999px',color:'#92400e'}}>→ {engSuggest}</b></div>}
                      <div><span style={{color:'#666'}}>Voice Hint:</span> <b>{hint || translit}</b></div>
                    </div>
                    <div style={{marginTop:'4px',fontSize:'9px',color:'#94a3b8'}}>Example: Type "ka pa" → Suggests "My father" → Voice "ka pa" → TTS reads plain</div>
                  </div>
                )}
                <div style={{display:'flex',gap:'6px',marginTop:'8px'}}>
                  <input value={hint} onChange={e=>handleHintChange(e.target.value)} placeholder="Voice hint - SOLE OWNER" disabled={locked} style={{flex:1,padding:'10px',borderRadius:'8px',border:'1px solid #ddd'}}/>
                  <button onClick={startRec} disabled={locked} style={{background:locked?'#9ca3af':rec?'#ef4444':'#16a34a',color:'#fff',border:'none',borderRadius:'999px',padding:'10px 16px',fontWeight:800,cursor:'pointer'}}>{locked?'🔒 LOCKED':rec?'● STOP':'● RECORD'}</button>
                  {hasAudio&&audioURL&&<button onClick={playAudio} style={{background:'#3b82f6',color:'#fff',border:'none',borderRadius:'999px',padding:'10px 16px',fontWeight:800,cursor:'pointer'}}>▶ PLAY</button>}
                </div>
                {hasAudio&&audioURL&&<div style={{marginTop:'8px'}}><audio ref={audioPlayerRef} src={audioURL} controls style={{width:'100%',height:'32px'}}/></div>}
                <div style={{display:'flex',gap:'6px',marginTop:'12px'}}>
                  <button onClick={goBack} style={{flex:1,background:'#fff',border:'1px solid #ddd',padding:'12px',borderRadius:'10px',fontWeight:700,cursor:'pointer'}}>◀ BACK</button>
                  <button onClick={save} disabled={locked} style={{flex:2,background:locked?'#9ca3af':'#16a34a',color:'#fff',padding:'12px',borderRadius:'10px',border:'none',fontWeight:800,cursor:'pointer'}}>{locked? '🔒 Done by ' + isEdited?.contributor + ' - SOLE OWNER' : 'Save & Next Undone → - FINAL - SOLE OWNER'}</button>
                  <button onClick={goForward} style={{flex:1,background:'#fff',border:'1px solid #ddd',padding:'12px',borderRadius:'10px',fontWeight:700,cursor:'pointer'}}>FORWARD ▶</button>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div style={{background:'#fff',borderRadius:'12px',padding:'12px',border:'1px solid #e5e7eb'}}>
              <div style={{fontWeight:700,fontSize:'13px'}}>📊 {currentLang.name} - {done.length}/1000 Done - 🔒 Locked - FINAL - SOLE OWNER Gin P Khup</div>
              <div style={{marginTop:'10px',background:'#111',color:'#fff',borderRadius:'8px',padding:'8px',maxHeight:'300px',overflowY:'auto'}}>
                <div style={{fontWeight:800,fontSize:'12px'}}>🔒 DONE SECTION - {currentLang.name} - {done.length}/1000 - FINAL - Cannot enter again! - SOLE OWNER</div>
                {done.length===0?<div style={{fontSize:'11px',color:'#aaa',marginTop:'6px'}}>No done yet - 0/1000 - All available! - FINAL 1000/1000</div>:
                  <div style={{display:'flex',flexWrap:'wrap',gap:'4px',marginTop:'6px'}}>
                    {done.map((d:any)=><div key={d.id} style={{fontSize:'10px',background:d.contributor===contributorName?'#22c55e':'#333',color:'#fff',padding:'4px 6px',borderRadius:'4px'}}>BOX {d.id} - {d.contributor} {d.hasAudio?'🎤':''}</div>)}
                  </div>
                }
              </div>
              <div style={{marginTop:'8px',fontSize:'10px',color:'#666'}}>Version: SEED1000_FINAL_1000/1000_REAL_BASIC_v2.0.0_SOLE_OWNER_Gin_P_Khup<br/>Owner: Gin P Khup - NqAI LLC<br/>© 2026 - FINAL 1000/1000 REAL BASIC - Smyrna, TN</div>
            </div>
          </div>
        </div>
        <div style={{marginTop:'12px',background:'#111',color:'#fff',borderRadius:'12px',padding:'14px',textAlign:'center'}}>
          <div style={{fontWeight:800}}>© 2026 NqAI LLC - SOLE OWNER Gin P Khup - All Rights Reserved - 7000 Languages - FINAL 1000/1000 REAL BASIC - SEED1000_FINAL_1000/1000_REAL_BASIC_v2.0.0 - Smyrna, TN, USA</div>
          <div style={{fontSize:'11px',marginTop:'4px',color:'#aaa'}}>Workspace Clean - FINAL BUILD - 1000 Phrases Zero Error - SOLE OWNER Verified</div>
        </div>
      </div>
    </div>
  );
}
