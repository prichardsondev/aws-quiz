### AWS Services Quiz

Note front and backend in one file. Front all in public folder<br/>
I borrowed front end heavily from<br/>
https://github.com/jamesqquick/Build-A-Quiz-App-With-HTML-CSS-and-JavaScript


##### To run:

open terminal to AWSQUIZ folder

npm install

npm start

for development run: npm run serve

browse to http://localhost:3000/

follow simple game

### API:
Structure app.js->route.js->controller.js->service.js->db.js <br/>
Contrived file names to make it easy to follow.<br/>
Note these would be folders of same name in actual app<br/>
Great blog post on express api structure below<br/>
https://www.coreycleary.me/project-structure-for-an-express-rest-api-when-there-is-no-standard-way

#### Files:
app.js - run server (serves frontend index.html and backend api - should break up into different projects)<br/>
route.js - direct endpoint calls to controller (no logic)<br/>
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
            },
```
