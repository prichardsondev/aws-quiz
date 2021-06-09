const fs = require('fs')

let catagories =  {
    "catagory": {
    }
}

//if someone fixes this ugly mess share with me -)
fs.readFile('aws.txt', 'utf8',  (err, data) => {
    let lines = data.split('\n\r');
    let questionArray = [];
    let distractorList = getDistractorList(lines);
    let catagory;
    lines.forEach((line) => {
        let words = line.split(" ");
        if(words[0].includes('.')) {
            catagory = words.splice(1).join('_');
            catagory = catagory.replace(/(\r\n|\n|\r)/gm, "").toLowerCase();
            catagories.catagory[catagory] = [];
            questionArray = [];
        }
        else {
            words.forEach((word,i) => {
                if(word.includes(':')) {
                    let answer = words.splice(0,i+1).join(' ').slice(0,-1).trim();
                    let question = words.join(' ').replace(/(\r\n|\n|\r)/gm, "");
                    let distractors = buildDistractors(answer, distractorList);
                    
                    questionArray.push({"question":question,"answer":answer, "distractors":distractors});
                }
            });
        }
        catagories.catagory[catagory] = questionArray;
    });
    fs.writeFileSync('./aws.json',JSON.stringify(catagories,null,4));
    //console.log(JSON.stringify(catagories,null,4));
});

let buildDistractors = (answer, distractorList) => {
    let answerRemoved = distractorList.filter(d=>d!==answer);
    return answerRemoved.sort(() => .5 - Math.random()).slice(0,3);
};

let getDistractorList = (data) => {
    let ret = [];
    data.forEach(line => {
        let words = line.split(" ");
        words.forEach((w,i) => {
            if(w.includes(":")) {
                let answer = words.splice(0,i+1).join(' ').slice(0,-1).trim();
                ret.push(answer);
            }
        });
    });

    return ret;
};

