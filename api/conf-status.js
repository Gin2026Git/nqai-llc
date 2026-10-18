export default function handler(req,res){
  console.log('conf-status',req.body);
  res.status(200).send('ok');
}
