const testData = await fetch('data.json').then(res => res.json());

// preload images
testData.forEach(({ img }) => {
    const imgEl = document.createElement('img');
    imgEl.src = img;
})


const languages = ['de', 'en']
let index = 0;
let language = 'en';
let testIndex = 0;


const allResults = [];
const nextTest = (() => {

    let testIndex = -1;

    const testEl = document.getElementById('test');
    const answerEls = Array.from(testEl.querySelectorAll('button'));
    const imageEl = testEl.querySelector('img');

    return () => {
        const answer = answerEls.indexOf(document.activeElement);
        if (allResults.length) {
            allResults[allResults.length - 1].answer = answer;
            allResults[allResults.length - 1].end = Date.now();
        }

        testIndex++;
        if (testIndex >= testData.length) return false;

        const test = testData[testIndex];
        // update UI
        imageEl.src = test.img;
        test.options[language].forEach((item, i) => {
            answerEls[i].textContent = item;
            const action = test.practice && i == test.correct ? 'add' : 'remove';
            answerEls[i].classList[action]('correct');
        });


        allResults.push({ ...test, start: Date.now() })

        return true;
    }
})();


const createResult = () => {
    const formatter = new Intl.DateTimeFormat(navigator.language, {
        hour12: false,
        timeZone: 'UTC',
        minute: "2-digit",
        second: "2-digit",
        fractionalSecondDigits: 2
    });


    const testResults = allResults.filter(result => !result.practice);

    const duration = testResults[testResults.length - 1].end - testResults[0].start;
    document.getElementById('duration').textContent = formatter.format(new Date(duration));

    const correct = testResults.filter(test => test.answer === test.correct).length;
    document.getElementById('correct').textContent = `${correct} / ${testResults.length}`;

    const detailsEl = document.getElementById('details');
    const trEl = detailsEl.querySelector('tr');
    detailsEl.removeChild(trEl);

    trEl.style = '';
    const fragment = document.createDocumentFragment()
    testResults.forEach(item => {
        const rowEl = trEl.cloneNode(true);
        const cellEls = Array.from(rowEl.querySelectorAll('td'));
        const getClass = (index) => item.correct === index ? 'correct' : 'incorrect';

        rowEl.querySelector('img').src = item.img;

        for (let i = 0; i < 4; i++) {
            cellEls[i + 1].classList.add(getClass(i));
            cellEls[i + 1].textContent = item.options[language][i]
        }

        cellEls[5].classList.add(getClass(item.answer));
        cellEls[5].textContent = item.options[language][item.answer];

        cellEls[6].textContent = formatter.format(new Date(item.end - item.start));

        fragment.appendChild(rowEl);
    });
    detailsEl.appendChild(fragment);
}


const sectionEls = [...document.querySelectorAll('section')];

const setLanguage = (newLanguage) => {
    language = newLanguage;
    languages
        .filter(lng => lng != language)
        .forEach(lng => Array.from(document.querySelectorAll(`.${lng}`)).forEach(el => el.style.display = 'none'))

}

const transitions = {
    0: (e) => {
        setLanguage(document.activeElement.value);
        nav(1);
    },
    1: (e) => {
        nextTest();
        nav(2);
    },
    2: (e) => {
        if (nextTest()) return;

        createResult();
        nav(3);
    }
}

document.addEventListener('submit', e => {
    e.preventDefault();
    transitions[index](e);
});

const nav = (navTo = 0) => {
    index = navTo;
    sectionEls.forEach((el, i) => el.style.display = i === index ? 'block' : 'none');
}
nav(0);