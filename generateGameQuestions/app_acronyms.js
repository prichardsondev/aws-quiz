const fs = require('fs');
const { get } = require('http');

let catagories = {
    "catagory": {
    }
}
let acryonymList = [];
let distractorList = [];


//if someone fixes this ugly mess share with me -)
fs.readFile('awsacronyms.txt', 'utf8', (err, data) => {
    let lines = data.split('\n');
    //console.log(lines.length); return;
    let questionArray = [];
    getAcronyms(lines);
    let catagory;
    lines.forEach((line) => {
        let words = line.split(/\s+/);
        //console.log('words: ', words);
        if (words[0].includes('.')) {
            catagory = words.splice(1).join('');
            //console.log('catagory ', catagory);
            catagory = catagory.replace(/(\r\n\t|\n|\r)/gm, "").toLowerCase();
            catagory.trim();
            catagories.catagory[catagory] = [];
            questionArray = [];
        }
        else {
            words.forEach((word, i) => {
                if (word.includes(':')) {
                    let question = words.splice(0, i + 1).join(' ').slice(0, -1).trim();
                    let answer = words.join(' ').replace(/(\r\n|\n|\r)/gm, "");
                    let distractors = buildDistractors(answer);

                    questionArray.push({ "question": question, "answer": answer, "distractors": distractors });
                }
            });
        }
        catagories.catagory[catagory] = questionArray;
    });
    fs.writeFileSync('./awsacronyms.json', JSON.stringify(catagories, null, 4));
});

let buildDistractors = (answer) => {
    let distractorArray = ["", "", ""];
    let answerWords = answer.split(" ");

    answerWords.forEach(w => {
        if (w.length > 2) {

            let letter = (w.slice(0, 1));
            for (let i = 0; i < 3; i++) {
                distractorArray[i] += randomWordThatStartsWith(letter) + " ";
            }
        }

    });

    return distractorArray;
};

let randomWordThatStartsWith = (startsWith) => {
    let list = distractorList.filter((a) => a.startsWith(startsWith));
    list.sort(function (a, b) { return 0.5 - Math.random() });
    return list[0];
}

let getAcronyms = (data) => {
    let ret = [];
    data.forEach(line => {
        let words = line.split(/\s+/);
        words.forEach((w, i) => {
            if (w.includes(":")) {
                //console.log("includes: ", w);
                let answer = words.splice(0, i + 1).join(' ').slice(0, -1).trim();
                acryonymList.push(answer);
            }
            else {
                //console.log("doesn't include: ", w.trim());

                if (!w.includes(".") && w.length > 1) {
                    //console.log(w.trim());
                    distractorList.push(w.trim());
                }
            }
        });
    });
};