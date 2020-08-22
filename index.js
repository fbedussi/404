const counter404El = document.querySelector('.counter404');
const timerEl = document.querySelector('.timer');
const remainingEl = document.querySelector('.remaining-counter');
const counter200El = document.querySelector('.counter200');
const btn1El = document.querySelector('.btn-1');
const btn2El = document.querySelector('.btn-2');
const backdropGoEl = document.querySelector('.backdrop-go');
const goEl = document.querySelector('.btn-go');
const backdropGameOverEl = document.querySelector('.backdrop-game-over');
const resultEl = document.querySelector('.result');
const playAgainEl = document.querySelector('.play-again');

const INITIAL_TIMER = 5;

const initialState = {
  links: [
    'en.wikipedia.org/wiki/Linux',
    'en.wikipedia.org/wiki/Wayland_(display_server_protocol)',
    'developer.mozilla.org/en-US/docs/Web/HTML/Element/button',
    'developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset',
    'freeonlinecasinoq.co/css3-slot-machine.php',
    'www.playcasinoz.co/css3-slot-machine-effect',
    'certbot.eff.org/instructions',
    'keepass.info/help/v1/version.html',
    'letsencrypt.org/docs',
    'keepassxc.org/download',
    'docs.traefik.io/providers/file/',
    'gitlab.touch.abssrv.it/users/sign_in',
    'www.pcmag.com/picks/the-best-free-password-managers',
    'vim.fandom.com/wiki/Undo_and_Redo',
    'babeljs.io/docs/en/babel-cli',
    'docs.mongodb.com/manual/reference/operator/query/all',
    'docs.mongodb.com/manual/reference/operator/aggregation/count',
    'css-tricks.com/snippets/css/complete-guide-grid',
    'create-react-app.dev/docs/adding-typescript',
    'www.elastic.co/guide/en/logstash/current/plugins-filters-aggregate.html',
    'www.motoguzzi.com/en_EN/moto-guzzi-world',
    'github.com/azure/aci-deploy',
    'www.benelli.com/country-selector',
    'www.pcmag.com/reviews/bitwarden',
    'apps.azureiotcentral.com/build',
    'www.youtube.com/c/CafeRacerGarage/videos',
    'material-ui-pickers.dev/api/Calendar',
    'material-ui.com/components/cards',
    'socket.io/docs/client-api',
    'www.w3schools.com/CSS/css_list.asp',
  ],
  usedLinks: [],
  interval: undefined,
  btn200: undefined,
  status: 'ready',
  tot200: 0,
  tot404: 0,
  timer: INITIAL_TIMER,
  link200: '',
  link404: '',
};
let state = {
  ...initialState,
  remaining: initialState.links.length,
};
// STATUS          -> 200
// ready -> play /        \ -> play -> over
//               \        /
//                 -> 404
let subscribers = [];

function setState(update) {
  nextState = {
    ...state,
    ...update,
  };
  // console.log(nextState);
  const oldState = { ...state };
  state = nextState;
  subscribers.forEach(
    ({ key, cb }) =>
      (!key || nextState[key] !== oldState[key]) && cb(nextState, oldState),
  );
}

function subscribe(key, cb) {
  subscribers.push({ key, cb });
}

subscribe('tot404', ({ tot404 }) => {
  counter404El.innerText = tot404;
});
subscribe('tot200', ({ tot200 }) => {
  counter200El.innerText = tot200;
});
subscribe('remaining', ({ remaining }) => {
  remainingEl.innerText = remaining;
});
subscribe('timer', ({ timer }) => {
  if (timer >= 0) {
    timerEl.innerText = timer;
  } else {
    setState({ tot404: state.tot404 + 1 });
    setNextQuestion();
  }
});
subscribe('status', ({ status, btn200, tot200, tot404, links, usedLinks }) => {
  backdropGameOverEl.hidden = status !== 'over';
  backdropGoEl.hidden = status !== 'ready';
  switch (status) {
    case 'play':
      setNextQuestion();
      [btn1El, btn2El].forEach(btn => {
        btn.classList.remove('r200');
        btn.classList.remove('r404');
      });
      break;
    case '200':
      [btn1El, btn2El][btn200 - 1].classList.add('r200');
      setTimeout(() => setState({ status: 'play' }), 1000);
      break;
    case '404':
      const btn404 = btn200 === 1 ? 2 : 1;
      [btn1El, btn2El][btn404 - 1].classList.add('r404');
      setTimeout(() => setState({ status: 'play' }), 1000);
      break;
    case 'over':
      clearInterval(state.interval);
      setState({ timer: INITIAL_TIMER });
      resultEl.innerText = tot200 > tot404 ? 'You won!' : 'You loose!';
      break;
  }
});
subscribe('link200', ({ link200, link404, btn200 }) => {
  if (btn200 === 1) {
    btn1El.innerText = link200;
    btn2El.innerText = link404;
  } else {
    btn1El.innerText = link404;
    btn2El.innerText = link200;
  }
});

function startTimer() {
  clearInterval(state.interval);
  setState({
    timer: INITIAL_TIMER,
    interval: setInterval(() => {
      setState({ timer: state.timer - 1 });
    }, 1000),
  });
}

function getIndex() {
  const index = Math.floor(Math.random() * state.links.length);
  return index;
}

function getRandomChar() {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, 1);
}

function getPathIndex(path) {
  return Math.round(Math.random() * (path.length - 1));
}

function wrongify(link) {
  const [_, domain, path] = link.match(/([^/]+)(.*)/);
  let index = getPathIndex(path);
  let char = path[index];
  while (char === '/') {
    index = getPathIndex(path);
    char = path[index];
  }
  let newChar = getRandomChar();
  while (newChar === char) {
    newChar = getRandomChar();
  }
  const link404 =
    domain +
    path
      .split('')
      .map((c, i) => (i === index ? newChar : c))
      .join('');
  return link404;
}

function splitDomain(link) {
  const [_, domain, path] = link.match(/([^/]+)(.*)/);
  return `${domain}\n${path}`;
}

function setNextQuestion() {
  if (state.usedLinks.length === state.links.length) {
    setState({ status: 'over' });
    return;
  }
  startTimer();

  let nextQuestionIndex = getIndex();
  while (state.usedLinks.includes(nextQuestionIndex)) {
    nextQuestionIndex = getIndex();
  }
  const link200 = splitDomain(state.links[nextQuestionIndex]);
  const link404 = wrongify(link200);
  const usedLinks = state.usedLinks.concat(nextQuestionIndex);
  setState({
    usedLinks,
    btn200: Math.random() > 0.5 ? 1 : 2,
    link200,
    link404,
    remaining: state.links.length - usedLinks.length,
  });
}

goEl.addEventListener('click', () => {
  setState({ status: 'play' });
});

[btn1El, btn2El].forEach((btn, index) => {
  btn.addEventListener('click', () => {
    if (state.status !== 'play') {
      return;
    }
    setState(
      state.btn200 === index + 1
        ? {
            status: '200',
            tot200: state.tot200 + 1,
          }
        : {
            status: '404',
            tot404: state.tot404 + 1,
          },
    );
  });
});

playAgainEl.addEventListener('click', () => {
  setState(initialState);
});

timerEl.innerText = INITIAL_TIMER;
