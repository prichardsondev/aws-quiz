### AWS Services Quiz

### Video Overview
https://www.screencast.com/t/RO9g474X9

### backend:

#### To run:

open terminal to AWSQUIZ/backend folder

npm install

npm start

or developer mode which restarts server on file save<br/>
npm run serve

Structure app.js->route.js->controller.js->service.js->db.js <br/>
Contrived file names to make it easy to follow.<br/>
Note these would be folders of same name in actual app<br/>
Great blog post on express api structure below<br/>
https://www.coreycleary.me/project-structure-for-an-express-rest-api-when-there-is-no-standard-way

#### Files:
app.js - run backend server<br/>
route.js - direct endpoint calls to controller<br/>
controller.js - strip out request data -> validate it -> call service<br/>
service.js - business logic (maybe better to validate here) -> shape data -> call db<br/>
db.js - calls to backend storage (services.json) change to any backend storage<br/>


GET <br/>
http://localhost:3000/learn/:catagory<br/>
ex:
http://localhost:3000/learn/compute


POST <br/>
http://localhost:3000/learn/:catagory <br/>

body<br/>
```javascript 
    {
        "question": "Fully managed ground station as a service",
        "answer": "AWS Ground Station",
        "distractors": [
            "Amazon Managed Streaming for Apache Kafka",
            "AWS Device Farm",
            "Amazon Translate"
        ]
    }
```

#### frontend
I borrowed front end heavily from<br/>
https://github.com/jamesqquick/Build-A-Quiz-App-With-HTML-CSS-and-JavaScript

#### To run:

open terminal to AWSQUIZ/frontend folder

npm install

npm start

follow simple game at localhost:4000


### generateGameQuestions

#### Files:
aws.txt - file holding questions<br/>
aws.json - json format created by app.js. used for backend as services.json<br/>
app.js - parses aws.txt -> creates aws.json

list of services to create aws.txt copied from<br/>
https://www.techradar.com/news/aws