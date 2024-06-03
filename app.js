const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const bcrypt = require('bcrypt')
const app = express()

app.use(express.json())

let db = null

const dbpath = path.join(__dirname, 'userData.db')

const initialize = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('server started')
    })
  } catch (e) {
    console.log(`${e.message}`)
    process.exit(1)
  }
}

initialize() //intialization and setting up of server

//Register API

app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const hashedPassword= await bcrypt.hash(password,12);
  const checkingquery = `select * from user where username="${username}"; `;
  const checkresult= await db.get(checkingquery);
  
  if (checkresult===undefined)
  {
    
    if(password.length<5){
        response.status(400);
        response.send(`Password is too short`);
    }
    else{
       
    const addingquery=`insert into user(username,name,password,gender,location) values(
        "${username}",
        "${name}",
        "${hashedPassword}",
        "${gender}",
        "${location}"
    );`;
    
    const addingresult= await db.run(addingquery);
    response.send(`User created successfully`);
    }
  }
  else{
    response.status(400);
    response.send(`User already exists`);
  }
});

//Login API

app.post("/login", async (request,response)=>{
    const {username,password}=request.body;
    const checkingquery2=`select * from user where username="${username}";`;
    const checkingresult2= await db.get(checkingquery2);

    if(checkingresult2===undefined){
        response.status(400);
        response.send(`Invalid user`);
    }
    else{
        let comparison=await bcrypt.compare(password,checkingresult2.password);

        if (comparison){
            response.status(200);
            response.send(`Login success!`);
        }
        else{
            response.status(400);
            response.send(`Invalid password`);
        }

    }
})

//change password API

app.put("/change-password", async (request,response)=>{
    const {username,oldPassword,newPassword}=request.body;
    const check3=`select * from user where username="${username}";`;
    const result3= await db.get(check3);

    if (result3===undefined){
        response.status(400);
        response.send(`Invalid user`);
    }
    else{
        let comparison2= await bcrypt.compare(oldPassword,result3.password);

         if(comparison2){
            
            if(newPassword.length<5){
                response.status(400);
                response.send(`Password is too short`);
            }
            else{
               const hashedNewPassword= await bcrypt.hash(newPassword);
               const updatequery=`update user set password="${hashedNewPassword}" where username="${username}";`;
               const resultfinal= await db.run(updatequery);
               response.status(200);
               response.send(`Password updated`);
             }
        }
        else{
            response.status(400);
            response.send(`Invalid current password`);
        }
    }
})

module.exports=app;
