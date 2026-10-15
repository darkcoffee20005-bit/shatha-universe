/**
 * ✦ A Universe Named After You — personalization file
 * ---------------------------------------------------------------
 * This is the ONLY file you need to edit to make the universe hers.
 * Application logic never needs to change.
 *
 * • Text inside [square brackets] is a clearly-labeled placeholder:
 *   replace it with your own words (and remove the brackets).
 * • Sample messages are written in Iraqi Arabic. To switch the
 *   interface language set LANGUAGE to 'en' (then write your
 *   content below in English too).
 * • Image / audio paths are RELATIVE to index.html, e.g.
 *   'assets/images/first-trip.jpg'. Missing files never break the
 *   site — an illustrated placeholder is shown instead.
 */

/* ── 1. Language ───────────────────────────────────────────────── */
// 'ar' (right-to-left, Iraqi dialect UI) or 'en' (left-to-right).
const LANGUAGE = 'ar';

/* ── 2. Core placeholders ──────────────────────────────────────── */
const HER_NAME = 'شذى';                 // her name
const HER_NAME_LATIN = 'Shatha';        // optional second script of her name ('' to hide)
const GALAXY_NAME = 'مجرّة شذاي';        // the galaxy title
const SPECIAL_NICKNAME = 'شذاي';        // used in the final letter greeting
const SIGNATURE = 'اللي يحبج';          // how the letters are signed

// Shown on the opening screen.
const WELCOME_MESSAGE =
  'أكو مكان بالكون ما شافه أحد بعد… لأن هذا المكان انبنى إلج إنتِ.';

// Revealed line by line after she wins the Catch-a-Star game.
const LOVE_MESSAGE = [
  'هاي الخمس نجوم مو صدفة…',
  'كل وحدة بيها شي منج يضوّي أيامي:',
  '✦ الأيام اللي أثبتت حبنا… لنفسنا ولبعض.',
  '✦ المشاكل اللي تجاوزناها سوا، وطلعنا منها أقوى.',
  '✦ ضحكتنا بكل ليلة سوا.',
  '✦ إنج بكل مرة تختاريني من جديد، حتى بأتعب أيامج.',
  '✦ والنجمة الخامسة… هي إني لگيتج.',
];

// Shown in the final reveal, under her name.
const FINAL_MESSAGE =
  'لو أگدر أختار نجمة من كل نجوم الكون، أختارج إنتِ… لأن أحلى شي صار برحلتي مو مكان وصلتله، بل وجودج بحياتي.';

// The last letter ("اقري آخر رسالة ✦"). One string per paragraph.
const FINAL_LETTER = [
  'سويت هذا الكون الصغير لأن الكلام العادي ما چان يكفي.',
  'كل كوكب مرّيتي بي چان محاولة أگولج نفس الشي بطريقة مختلفة: إنتِ مهمة، وإنتِ محبوبة، وإنتِ مو وحدج.',
  'يا عمري الجاي والحاضر…',
  'ما أعرف شنو يخبّيلنا باچر، بس أعرف إني أريد أكون جنبج بكل خطوة.',
  'ومهما يصير… هذا الكون راح يبقى باسمج.',
];

/* ── 3. Memories (Planet of Memories) ──────────────────────────────
 * Fields: title, date (optional), text, image (optional path),
 * imageAlt (optional), position (optional {x, y} in % of the sky).  */
const MEMORIES = [
  {
    title: 'وفاءج',
    date: '',
    text:
      'أول نجمة لازم تكون إلج إنتِ، ولوفاءج.\n' +
      'بكل مرة الدنيا ضاگت، لگيتج ماسكة إيدي أقوى. ما تركتيني بيوم صعب، ولا حسستيني إني وحدي.\n' +
      'تمسّكج بيّه علّمني إن الحب الحقيقي مو بس كلام حلو… هو ناس تبقى.\n' +
      'وأني ممتنّ إلج من كل گلبي، على كل يوم بقيتي بيه يمّي، وعلى كل مرة اخترتيني بيها من جديد.',
    image: 'assets/images/memory-1-loyalty.jpg',
    imageAlt: 'رسائلها اللي تثبت وفاءها',
  },
  {
    title: 'عيد ميلادي… وسواري',
    date: '',
    text:
      'بعيد ميلادي انطيتيني سوار… ومن يومها صار جزء مني.\n' +
      'يمكن غيري يشوفه شي صغير يتلبس بالإيد، بس آني أشوفه حبّج ملفوف على معصمي.\n' +
      'كل ما أباوعله أتذكر إن أكو وحدة بهالدنيا فكّرت بيّه، واختارت، واهتمّت حتى تفرّحني.\n' +
      'وكارتج الصغير اللي جنبه، بخط إيدج: «أحبك مهندسي»… صار أغلى من أي ساعة بالدنيا.\n' +
      'أحبه كلش كلش… لأنه منّج، ولأني كل ما ألمسه أحس إنج ويّاي حتى لو بعيدة.',
    image: 'assets/images/memory-2-bracelet.jpg',
    imageAlt: 'السوار والكارت اللي كتبته بإيدها',
  },
  {
    title: 'القراصة مالتج',
    date: '',
    text:
      'القراصة مالتج ما تفارقني بأي سفرة.\n' +
      'صارت فالي الحلو، أتفاءل بيها قبل كل طريق، وأحسها حارستني.\n' +
      'فرّرتها ويّاي من زاخو للبصرة… شمال العراق لجنوبه، وإنتِ ويّاي بكل كيلومتر.\n' +
      'يمكن هي قراصة صغيرة، بس بجيبي چانت أكبر من كل المسافات.',
    image: 'assets/images/memory-3-clip.jpg',
    imageAlt: 'القراصة بالإيد بيوم ممطر',
  },
  {
    title: 'كارت عيد ميلادج وراس السنة',
    date: '',
    text:
      'قرب عيد ميلادج وراس السنة… تتذكرين منو كتب هذا الكارت؟ 🙂\n' +
      '«This year Merry Christmas… next year marry me» 🤍\n' +
      'كل كلمة بيه چانت طالعة من گلبي قبل إيدي، وچنت أعنيها حرف حرف.\n' +
      'وأتمنى هالسنة نگعد آني وياج، نفرّش الكروت كلها گدامنا، وندوّره بيناتهم سوا…\n' +
      'ونضحك على كل ذكرى نلگاها، ونكتب كارت جديد لسنة جديدة تجمعنا.',
    image: 'assets/images/memory-4-card.jpg',
    imageAlt: 'كارت This year Merry Christmas, next year marry me',
  },
  {
    title: 'هذا الورد… إلج',
    date: '',
    text:
      'وآخر شي… هذا الورد إلج.\n' +
      'أنطيج ياه للمرة الثانية، بس هالمرة عليه لمستج إنتِ 😄\n' +
      'لأن الورد مهما چان حلو، ما يكمل حلاه إلا من يوصل لإيدج.\n' +
      'وكل ورد بالدنيا يبقى أقل من ضحكتج لمن تستلميه.',
    image: 'assets/images/memory-5-flowers.jpg',
    imageAlt: 'باقة الورد',
  },
];

/* ── 4. Little things (Planet of Little Things) ──────────────────── */
const LITTLE_THINGS = [
  {
    icon: '✦',
    label: 'صفة أحبها بيج',
    text: 'لطافتج، وأسلوبج الطفولي اللي يذوّب گلبي، وحنّيتج اللي تحسسني إني بأمان.',
  },
  {
    icon: '☾',
    label: 'عادة تضحكني',
    text: 'من تخبصيني خبص على شي… وبالأخير تگوليلي: «أصلاً ما أحتاجه وما أريده» 😂',
  },
  {
    icon: '✧',
    label: 'شي صغير أتذكره',
    text: 'يوم جبتلج قلادة الياسمينة، وچنت خايف ما تعجبج… وبعدين خلّيتيها ويا أغراضج المميزة ولبستيها هواية. هذاك اليوم عرفت إن هداياي توصل لگلبج.',
  },
  {
    icon: '❀',
    label: 'شي أقدّره بيج',
    text: 'أقدّر وجودج بكل وقت، وأقدّر شگد مهتمة إنج ترضيني بكل شي تسوّيه… حتى بالأشياء اللي ما تگوليها.',
  },
  {
    icon: '✺',
    label: 'شلون خلّيتي حياتي أحلى',
    text: 'صار لأيامي العادية طعم، وصار عندي أحد أركضله بكل خبر حلو قبل الكل. صرت أبتسم بلا سبب… والسبب إنتِ.',
  },
  {
    icon: '◌',
    label: 'شي ما گلتلج ياه',
    text: 'أكو شي بداخلي ما لگيتله اسم بكل اللغات… كل اللي أعرفه إنه يصحى من تحچين، وينام بس من أطمّن عليج. يمكن هذا هو الحب… ويمكن هو إنتِ.',
  },
];

/* ── 5. Secret letters (Planet of Secret Letters) ───────────────── */
const SECRET_LETTERS = [
  {
    id: 'smile',
    label: 'افتحيها لمن تحتاجين ضحكة',
    title: 'لمن تحتاجين ضحكة',
    paragraphs: [
      'إذا وصلتي لهنا يعني تحتاجين ضحكة…',
      'تذكّري كل ما تاكلين زنجر، تخليني آني ووليد بفرعكم ناكل وياج 😂',
      'وحتى لو آني بعيد، اعرفي إني بنفس اللحظة دا أبتسم لأن إنتِ تبتسمين.',
    ],
  },
  {
    id: 'miss',
    label: 'افتحيها لمن تشتاقيلي',
    title: 'لمن تشتاقيلي',
    paragraphs: [
      'إذا اشتقتيلي، غمّضي عيونج شوية… آني هم هسه دا أفكر بيج.',
      'إنتِ مو خيار اخترتيه حتى تصيرين يمّي وبس… إنتِ نعمة، أدعي رب العالمين يديمها إلي دوم.',
      'والشوگ اللي بيناتنا مو بُعد… هو دليل إن گلوبنا گريبة.',
    ],
  },
  {
    id: 'special',
    label: 'افتحيها لمن تحتاجين تتذكرين شكد إنتِ مميزة',
    title: 'لمن تنسين شكد إنتِ مميزة',
    paragraphs: [
      'إنتِ مو بس مميزة، إنتِ نادرة. من النوع اللي يخلي الدنيا أحلى بس لأنه موجود.',
      'لا تنسين هالشي أبداً، حتى بالأيام الثقيلة.',
      'أتمنى أنطيج عيوني يوم واحد، حتى تشوفين نفسج شگدج مميزة بنظري.',
    ],
  },
];

/* ── 6. Optional photos & music ─────────────────────────────────── */
const PHOTO_PATHS = {
  final: '', // e.g. 'assets/images/us.jpg' — shown in the final reveal
  finalAlt: '[وصف الصورة الأخيرة]',
};

// Music is OFF by default and only starts after she presses the sound button.
// If the file is missing, a soft generated ambient tone is used instead.
const MUSIC = {
  src: 'assets/audio/ambient.mp3', // [ADD AN OPTIONAL MP3 HERE]
  volume: 0.45,
};

/* ── 7. Planet names (shown on the galaxy map) ──────────────────── */
const PLANETS = {
  memories: { title: 'كوكب الذكريات', description: 'كل نجمة بيه لحظة ما أريدها تنتسى.' },
  littleThings: { title: 'كوكب الأشياء الصغيرة', description: 'التفاصيل اللي يمكن ما تنتبهيلها… بس آني انتبهتلها.' },
  letters: { title: 'كوكب الرسائل السرية', description: 'ثلاث رسائل مختومة، كل وحدة إلها وقتها.' },
  game: { title: 'اصطادي نجمة', description: 'لعبة صغيرة… وجايزتها كلام من گلبي.' },
  final: { title: 'النجمة الأخيرة', description: 'آخر محطة بالرحلة.' },
};

/* =================================================================
 * Everything below is assembled automatically — no need to edit.
 * ================================================================= */
export const CONFIG = {
  language: LANGUAGE,
  herName: HER_NAME,
  herNameLatin: HER_NAME_LATIN,
  galaxyName: GALAXY_NAME,
  nickname: SPECIAL_NICKNAME,
  signature: SIGNATURE,
  welcomeMessage: WELCOME_MESSAGE,
  loveMessage: LOVE_MESSAGE,
  finalMessage: FINAL_MESSAGE,
  finalLetter: FINAL_LETTER,
  memories: MEMORIES,
  littleThings: LITTLE_THINGS,
  letters: SECRET_LETTERS,
  photos: PHOTO_PATHS,
  music: MUSIC,
  planets: PLANETS,
};

/** Interface text. Add a language by copying one block. */
export const UI_STRINGS = {
  ar: {
    dir: 'rtl',
    locale: 'ar-IQ',
    docTitle: 'كون باسم {name} ✦',
    entranceOverline: 'كون صغير، انبنى باسم وحدة بس',
    start: 'ابدئي رحلتج ✦',
    continue: 'كمّلي رحلتج ✦',
    skip: 'تخطّي',
    galaxyOverline: 'أهلاً بيج بـ',
    progress: '{n} من {total} عوالم مكتشفة',
    hintNext: '{title} دا ينطرج ✦',
    hintDone: 'كل العوالم انكشفت… هذا الكون كله إلج.',
    statusLocked: 'مقفول',
    statusAvailable: 'جاهز تكتشفيه',
    statusDone: 'اكتشفتيه ✓',
    lockedToast: 'هذا الكوكب يفتح بعد ما تخلصين «{title}» ✦',
    lockedRedirect: 'هذا الكوكب بعده مقفول، رجعناج للمجرة.',
    worldCompleted: '«{title}» انكشف ✦',
    back: 'المجرة',
    backToGalaxy: 'ارجعي للمجرة ✦',
    soundOn: 'شغّلي الموسيقى',
    soundOff: 'طفّي الموسيقى',
    soundFallback: 'ما لگيت ملف الموسيقى، فشغّلتلج نغمة هادئة بداله.',
    soundUnavailable: 'الصوت مو مدعوم بهذا المتصفح.',
    close: 'سكّري',
    prev: 'اللي گبلها',
    next: 'الجاية',
    memoriesHint: 'كل نجمة هنا ذكرى… اضغطي على أي وحدة.',
    memoriesProgress: '{n} من {total} ذكريات',
    memoryLabel: 'ذكرى {n}',
    memoriesComplete: 'كوكبة الذكريات اكتملت ✦',
    photoPlaceholder: 'ذكرى محفوظة بين النجوم ✦',
    thingsHint: 'أشياء صغيرة، بس هي اللي تسوّي الفرق. المسي كل ضوّة.',
    thingsProgress: '{n} من {total} انكشفت',
    thingsComplete: 'كل الأشياء الصغيرة انكشفت ✦',
    lettersHint: 'ثلاث رسائل مختومة، كل وحدة إلها وقتها.',
    lettersProgress: '{n} من {total} رسائل انفتحت',
    letterOpened: 'انفتحت ✓',
    letterSealed: 'مختومة',
    lettersComplete: 'كل الرسائل انقرت ✦',
    gameRulesTitle: 'اصطادي خمس نجوم',
    gameRules: 'عندج {seconds} ثانية تجمعين بيها {total} نجوم. اضغطي على النجمة حتى تصيدينها.',
    gameKeyboardHint: 'بالكيبورد: Tab للتنقّل و Enter للصيد.',
    gameStart: 'يلا نبدي ✦',
    gameAlreadyWon: 'فزتي بيها گبل ✦ بس تگدرين تلعبين مرة ثانية.',
    gameTime: 'الوقت',
    gameStars: 'النجوم',
    gameStarLabel: 'نجمة — اضغطي حتى تصيديها',
    gameArenaLabel: 'ساحة اللعب. اضغطي Enter حتى تصيدين أقدم نجمة ظاهرة.',
    gameStarted: 'بدت اللعبة! عندج {seconds} ثانية.',
    gameScore: '{n} من {total}',
    gameLoseTitle: 'خلص الوقت…',
    gameLose: 'جمعتي {n} من {total}. عادي، النجوم بعدها تنطرج.',
    gameRetry: 'جرّبي مرة ثانية ↺',
    gameWin: 'جمعتي كل النجوم! ✦',
    gameUnlocked: 'النجمة الأخيرة صحت بالمجرة ✦',
    finalRead: 'اقري آخر رسالة ✦',
    finalGreeting: 'إلى {nickname}،',
    replay: 'عيدي الرحلة ↺',
    confirmTitle: 'نرجع للبداية؟',
    confirmText: 'كل العوالم راح ترجع مقفولة وتبدين الرحلة من جديد.',
    confirmYes: 'إي، عيديها',
    confirmNo: 'لا، خليني هنا',
  },
  en: {
    dir: 'ltr',
    locale: 'en',
    docTitle: 'A Universe Named After {name} ✦',
    entranceOverline: 'A small universe, built for one person only',
    start: 'Begin your journey ✦',
    continue: 'Continue your journey ✦',
    skip: 'Skip',
    galaxyOverline: 'Welcome to',
    progress: '{n} of {total} worlds discovered',
    hintNext: '{title} is waiting for you ✦',
    hintDone: 'Every world is discovered… this whole universe is yours.',
    statusLocked: 'Locked',
    statusAvailable: 'Ready to explore',
    statusDone: 'Discovered ✓',
    lockedToast: 'This world opens after “{title}” ✦',
    lockedRedirect: 'That world is still locked — back to the galaxy.',
    worldCompleted: '“{title}” discovered ✦',
    back: 'Galaxy',
    backToGalaxy: 'Back to the galaxy ✦',
    soundOn: 'Play music',
    soundOff: 'Mute music',
    soundFallback: 'Music file not found — playing a soft ambient tone instead.',
    soundUnavailable: 'Sound is not supported in this browser.',
    close: 'Close',
    prev: 'Previous',
    next: 'Next',
    memoriesHint: 'Every star here is a memory… tap any of them.',
    memoriesProgress: '{n} of {total} memories',
    memoryLabel: 'Memory {n}',
    memoriesComplete: 'The memory constellation is complete ✦',
    photoPlaceholder: 'A photo of this memory goes here',
    thingsHint: 'Small things — the ones that make all the difference. Touch each light.',
    thingsProgress: '{n} of {total} revealed',
    thingsComplete: 'Every little thing is revealed ✦',
    lettersHint: 'Three sealed letters, each with its own moment.',
    lettersProgress: '{n} of {total} letters opened',
    letterOpened: 'Opened ✓',
    letterSealed: 'Sealed',
    lettersComplete: 'Every letter has been read ✦',
    gameRulesTitle: 'Catch five stars',
    gameRules: 'You have {seconds} seconds to catch {total} stars. Tap a star to catch it.',
    gameKeyboardHint: 'Keyboard: Tab to move, Enter to catch.',
    gameStart: 'Let’s go ✦',
    gameAlreadyWon: 'You already won ✦ but you can play again.',
    gameTime: 'Time',
    gameStars: 'Stars',
    gameStarLabel: 'Star — press to catch it',
    gameArenaLabel: 'Play area. Press Enter to catch the oldest visible star.',
    gameStarted: 'Game started! You have {seconds} seconds.',
    gameScore: '{n} of {total}',
    gameLoseTitle: 'Time’s up…',
    gameLose: 'You caught {n} of {total}. That’s okay — the stars are still waiting.',
    gameRetry: 'Try again ↺',
    gameWin: 'You caught every star! ✦',
    gameUnlocked: 'The Final Star has woken up in the galaxy ✦',
    finalRead: 'Read the last letter ✦',
    finalGreeting: 'To {nickname},',
    replay: 'Replay the journey ↺',
    confirmTitle: 'Start over?',
    confirmText: 'Every world will lock again and the journey begins from the start.',
    confirmYes: 'Yes, replay',
    confirmNo: 'No, stay here',
  },
};
