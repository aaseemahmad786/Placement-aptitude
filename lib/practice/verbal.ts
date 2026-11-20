import { buildChapterPractice, wordSets, type PracticeAsk, type PracticeBuilder, type WordSet } from "./helpers";

type WordBank = { slug: string; prompt: string; why: string; sets: WordSet[] };
const w = (correct: string, a: string, b: string, c: string): WordSet => [correct, a, b, c];

const wordBanks: WordBank[] = [
  { slug: "sentence-completion-cloze", prompt: "Choose the best sentence completion.", why: "Preserve both the grammar and the meaning of the sentence.", sets: [
    w("The report was concise, so it was easy to follow.", "The report was concise, so it was impossible to understand.", "The report was concise, so the report vanished.", "The report was concise, so no report existed."),
    w("Although the task was difficult, the team finished on time.", "Although the task was difficult, the team never started.", "Although the task was difficult, finishing was impossible.", "Although the task was difficult, the deadline was deleted."),
    w("The evidence was limited, so the conclusion was tentative.", "The evidence was limited, so the conclusion was certain.", "The evidence was limited, so all evidence disappeared.", "The evidence was limited, so the conclusion was proven beyond doubt."),
    w("She was meticulous, and her work contained few errors.", "She was meticulous, and her work contained constant errors.", "She was careless, and her work never contained errors.", "She was meticulous, so she avoided every check."),
    w("The proposal was feasible, so the board approved it.", "The proposal was feasible, so approval was impossible.", "The proposal was impossible, so success was guaranteed.", "The proposal was feasible, so no decision was needed."),
    w("The instructions were not vague but precise.", "The instructions were not vague but ambiguous.", "The instructions were not vague but unclear.", "The instructions were not vague but uncertain."),
    w("The approach was not costly but economical.", "The approach was not costly but expensive.", "The approach was not costly but lavish.", "The approach was not costly but extravagant."),
    w("The response was not late but prompt.", "The response was not late but delayed.", "The response was not late but tardy.", "The response was not late but overdue."),
    w("The manager listened carefully before responding.", "The manager listened carefully before responding of concern.", "The manager listened carefully before response's answering.", "The manager listened carefully before responding with concern."),
    w("Regular review helps identify mistakes early.", "Regular review helps mistakes identifying early.", "Regular review help identify mistakes early.", "Regular review helps to mistakes identified early."),
  ]},
  { slug: "grammar-tenses-error-detection", prompt: "Choose the grammatically correct sentence.", why: "Check subject–verb agreement, tense, pronoun reference and modifiers.", sets: [
    w("The list of items is on the desk.", "The list of items are on the desk.", "The list of items were on the desk.", "The list of items have on the desk."),
    w("Each candidate has a form.", "Each candidate have a form.", "Each candidate having a form.", "Each candidate are a form."),
    w("Neither answer is correct.", "Neither answer are correct.", "Neither answer were correct.", "Neither answers is correct."),
    w("The quality of the samples is satisfactory.", "The quality of the samples are satisfactory.", "The quality of the samples were satisfactory.", "The quality of the samples have satisfactory."),
    w("She has worked here since 2022.", "She has worked here for 2022.", "She is worked here since 2022.", "She work here since 2022."),
    w("They had left before I arrived.", "They have left before I arrive yesterday.", "They was leave before I arrived.", "They leaving before I arrived."),
    w("I will call you when I reach home.", "I will call you when I will reach home.", "I call you when I will home.", "I will calling you when I reach home."),
    w("Riya gave the notebook to Meera because she needed it.", "Riya gave the notebook to Meera because she needed Riya's address.", "Because she needed it, Riya gave notebook to Meera.", "Riya she gave the notebook to Meera it."),
    w("Walking to work, I noticed a new café.", "Walking to work, a new café was noticed by me.", "Walking to work, there was a café noticed.", "Walking to work, noticing was done by a café."),
    w("She did not attend the meeting yesterday.", "She did not attended the meeting yesterday.", "She do not attend the meeting yesterday.", "She not did attendance yesterday."),
  ]},
  { slug: "sentence-correction-improvement", prompt: "Choose the clearest error-free version.", why: "Remove dangling modifiers, redundancy and agreement errors without changing meaning.", sets: [
    w("Running to catch the bus, I dropped my bag.", "Running to catch the bus, my bag fell.", "Running to catch the bus, there was a dropped bag.", "Running to catch the bus, the dropping of my bag occurred."),
    w("Walking through the park, she saw a peacock.", "Walking through the park, a peacock was seen.", "Walking through the park, seeing happened.", "Walking through the park, there was seen a peacock."),
    w("Turning the key, he opened the lock.", "Turning the key, the lock opened by him.", "Turning the key, opening was done.", "Turning the key, there was an opened lock."),
    w("Having finished the report, she emailed it.", "Having finished the report, emailing was done by she.", "Having finished the report, the email sent itself.", "Having finished the report, there was an email sent."),
    w("The report is brief and clear.", "The report is brief and short and clear in meaning.", "The report is a brief summary that is short.", "The report is clear and it is clear in meaning."),
    w("Please review the proposal before Friday.", "Please kindly do the review before the day of Friday.", "Please review prior to the time before Friday.", "Please do a review before Friday arrives."),
    w("The report was prepared by the analyst.", "The report is prepared by the analyst yesterday.", "The report prepared was by analyst.", "The report has prepare by the analyst."),
    w("The files are reviewed every week.", "The files is reviewed every week.", "The files are review every week.", "The files have reviewing every week."),
    w("This solution is more efficient than the previous one.", "This solution is more efficient than the previous solution's efficiency.", "This solution is most efficient than the previous one.", "This solution is efficient more than previous."),
    w("The task was difficult, but the team completed it.", "The task was difficult, so the team did not complete it.", "The task was difficult because completion was easy.", "The task was difficult although completing it."),
  ]},
  { slug: "vocabulary-in-context", prompt: "Choose the word with the closest meaning.", why: "Match the precise meaning and part of speech, using context clues.", sets: [
    w("lucid: clear", "lucid: rare", "lucid: stubborn", "lucid: plentiful"),
    w("scarce: rare", "scarce: clear", "scarce: abundant", "scarce: honest"),
    w("obstinate: stubborn", "obstinate: honest", "obstinate: rare", "obstinate: abundant"),
    w("abundant: plentiful", "abundant: scarce", "abundant: candid", "abundant: stubborn"),
    w("candid: honest", "candid: unclear", "candid: scarce", "candid: abundant"),
    w("expand: contract", "expand: reveal", "expand: hopeful", "expand: flexible"),
    w("transparent: opaque", "transparent: expand", "transparent: pessimistic", "transparent: rigid"),
    w("optimistic: pessimistic", "optimistic: hopeful", "optimistic: transparent", "optimistic: constructive"),
    w("rigid: flexible", "rigid: firm", "rigid: hopeful", "rigid: transparent"),
    w("constructive: harmful", "constructive: helpful", "constructive: optimistic", "constructive: flexible"),
  ]},
  { slug: "idioms-spelling-analogies", prompt: "Choose the correct meaning, spelling or relationship.", why: "Interpret figurative meanings, standard spelling and word relationships precisely.", sets: [
    w("bite the bullet: face a difficulty bravely", "bite the bullet: avoid every challenge", "bite the bullet: speak loudly", "bite the bullet: waste an opportunity"),
    w("once in a blue moon: very rarely", "once in a blue moon: very frequently", "once in a blue moon: every day", "once in a blue moon: always"),
    w("on the same page: share an understanding", "on the same page: disagree openly", "on the same page: read the same book", "on the same page: finish early"),
    w("cut corners: save effort carelessly", "cut corners: follow every rule", "cut corners: work harder", "cut corners: pay extra"),
    w("break the ice: make people comfortable", "break the ice: end a conversation", "break the ice: start an argument", "break the ice: arrive late"),
    w("accommodation", "accomodation", "acommodation", "accommadation"),
    w("privilege", "priviledge", "privelege", "privilege's"),
    w("maintenance", "maintainance", "maintenence", "maintainances's"),
    w("bird:flock :: fish:school", "bird:flock :: fish:fin", "bird:flock :: fish:swim", "bird:flock :: fish:pond"),
    w("author:book :: composer:symphony", "author:book :: composer:piano", "author:book :: composer:audience", "author:book :: composer:writing"),
  ]},
  { slug: "prepositions-articles-voice-speech", prompt: "Choose the correct preposition, article or transformation.", why: "Use standard collocations, article rules and the appropriate grammatical form.", sets: [
    w("She is proficient in Python.", "She is proficient at Python.", "She is proficient on Python.", "She is proficient with Python."),
    w("He is responsible for testing.", "He is responsible of testing.", "He is responsible to testing.", "He is responsibility for testing."),
    w("The report consists of three sections.", "The report consists from three sections.", "The report consists with three sections.", "The report consists to three sections."),
    w("She is an engineer at a university.", "She is a engineer at an university.", "She is an engineer at an university.", "She is a engineer at a university."),
    w("He bought a useful book yesterday.", "He bought an useful book yesterday.", "He bought a usefulness book yesterday.", "He bought an usefulness book yesterday."),
    w("The sun rises in the east.", "A sun rises in a east.", "An sun rises in the east.", "The sun rises in an east."),
    w("The letter has been sent.", "The letter have been sent.", "The letter has being sent.", "The letter is been sent."),
    w("The bridge was built in 2020.", "The bridge built in 2020 was.", "The bridge is build in 2020.", "The bridge has built in 2020 yesterday."),
    w("She said that she was busy.", "She said that I am busy.", "She said that she is being busy.", "She said me that she tired."),
    w("He said that he would call later.", "He said that he will called later.", "He said that I would call later.", "He said me he calling later."),
  ]},
  { slug: "email-writing-communication", prompt: "Choose the best professional email expression.", why: "Use a clear purpose, polite tone, specific request and practical next step.", sets: [
    w("Request: Testing schedule and proposed deadlines", "HELLO!!!", "Important stuff", "Read now"),
    w("Follow-up: Client meeting actions and next steps", "Meeting", "Please respond now", "Stuff to discuss"),
    w("Update: Workshop postponed to 20 July", "Workshop", "Read immediately", "Change of all things"),
    w("Invitation: Project review on 12 August", "Project", "Come now", "Meeting about everything"),
    w("Approval request: Travel expenses for the site visit", "Travel", "Pay immediately", "Money stuff"),
    w("Dear Ms. Rao,", "Hey, you!", "Yo, person", "What's up, everyone"),
    w("Dear Mr. Shah,", "Hey, Shah!", "To person", "Mr. Shah's office:"),
    w("I am writing to request the latest project update.", "Give me the update now.", "Send all information immediately.", "You must have the update ready."),
    w("Please send the attendance data for the workshop.", "Send data.", "Fix everything now.", "You should already have sent this."),
    w("Please confirm the expected delivery date.", "When is it coming? Answer now.", "Do whatever is necessary.", "The date is due whenever I decide."),
  ]},
];

const wordChapters: Record<string, PracticeBuilder[]> = {};
for (const bank of wordBanks) {
  wordChapters[bank.slug] = bank.sets.map((set, index) => (v, a) => wordSets(a, `${bank.prompt} Set ${v + 1}.`, [set], bank.why, v));
}

type Passage = { text: string; correct: string; wrong: string[]; why: string };
const p = (text: string, correct: string, wrong: string[], why: string): Passage => ({ text, correct, wrong, why });
const reading: Passage[] = [
  p("Urban gardens provide fresh produce, cool buildings and places for neighbours to meet.", "Urban gardens have environmental and social benefits", ["Cities no longer need rural farms", "Only rooftops can produce food", "Gardening has no social value"], "The passage lists produce, cooling and social contact."),
  p("Remote work saves commuting time, but employees miss informal conversations. Some teams add occasional office meetings.", "Remote work has benefits and collaboration challenges", ["Remote work eliminates every cost", "Office meetings are always useless", "All employees dislike remote work"], "The passage balances time savings with collaboration concerns."),
  p("Digital payments are convenient, but outages can prevent purchases. Some shops keep cash as a backup.", "Payment systems need a backup for outages", ["Cash is completely obsolete", "Digital payments never fail", "All shops reject digital payments"], "The outage risk explains the backup payment option."),
  p("A community centre offers evening computing and language classes for adults.", "The centre supports practical adult learning", ["Only children can attend", "All classes are free", "Computing is the only subject"], "The passage describes adult learning opportunities."),
  p("Public libraries provide books, internet access, workshops and study spaces.", "Libraries serve multiple community needs", ["Libraries should stop lending books", "Internet is their only service", "Workshops have replaced all books"], "Several services are listed alongside books."),
];
const inference: Passage[] = [
  p("An outdoor event continued despite heavy rain, with attendance below expectations.", "Rain may have discouraged some attendees", ["The event was cancelled", "Every ticket was refunded", "Nobody entered"], "Lower turnout during rain suggests a possible effect."),
  p("A commuter switched from a delayed train to a bus and arrived on time.", "The commuter adapted to a train disruption", ["She has never used a train", "Buses are always faster", "The signal failure also affected buses"], "The route change followed the train disruption."),
  p("A recycling drive collected more material, but contamination increased.", "Better sorting guidance may be needed", ["Recycling always increases waste", "All material was usable", "Workers stopped collecting"], "Contamination suggests a need for clearer instructions."),
  p("Students taking short breaks remembered more than students studying continuously for the same total time.", "Breaks may support retention in a fixed study period", ["Breaks remove the need to study", "Longer study always improves memory", "The total study times differed"], "The comparison keeps total study time constant."),
  p("Peer review found small errors before release, so the team added a review checklist.", "The team used review findings to improve its process", ["The project had no errors", "Checklists guarantee perfection", "The next project was cancelled"], "The checklist responds to the errors found."),
];
const tone: Passage[] = [
  p("The launch was remarkably successful, although its high costs deserve consideration.", "Balanced with reservations", ["Entirely hostile", "Uncritically enthusiastic", "Indifferent and joking"], "Praise is qualified by a cost concern."),
  p("The proposal is practical and well-supported and deserves serious consideration.", "Supportive", ["Sarcastic", "Dismissive", "Threatening"], "The evaluative words signal approval."),
  p("Another delayed announcement, another set of promises. We have heard this before.", "Sceptical", ["Celebratory", "Neutral and detached", "Affectionate"], "Repeated promises are presented with doubt."),
  p("The report compares three methods and lists the conditions under which each performs best.", "Objective", ["Emotional", "Sarcastic", "Alarmist"], "The language focuses on comparison and evidence."),
  p("Careless handling of public funds is deeply troubling and demands an explanation.", "Concerned", ["Amused", "Complimentary", "Detached"], "The wording expresses concern and demands accountability."),
];
const context: Passage[] = [
  p("The manager gave a concise summary instead of a long presentation.", "Brief and clear", ["Unnecessarily lengthy", "Highly emotional", "Factually false"], "Concise contrasts with a long presentation."),
  p("Simple steps can mitigate the impact of the flood.", "Reduce", ["Measure", "Ignore", "Predict perfectly"], "Mitigate means to make less severe."),
  p("The instructions were ambiguous, so readers interpreted them differently.", "Open to multiple interpretations", ["Extremely precise", "Completely illegal", "Easy to measure"], "Different interpretations show ambiguity."),
  p("A resilient system recovered quickly after the outage.", "Able to recover", ["Unable to change", "Always inactive", "Very expensive"], "Resilient means able to recover from difficulty."),
  p("The committee will scrutinise the accounts before approving the budget.", "Examine carefully", ["Hide", "Approve immediately", "Copy"], "Scrutinise means to inspect closely."),
];
const recall: Passage[] = [
  p("The centre opens at 9 am, runs four Saturday workshops and requires registration one day in advance.", "Registration is required one day in advance", ["It opens at 10 am", "Workshops run on Friday", "No registration is needed"], "Only the advance-registration detail matches."),
  p("The pilot used 120 devices for six weeks. Each recorded temperature every five minutes.", "Readings were taken every five minutes", ["There were 100 devices", "The pilot lasted five weeks", "Readings were hourly"], "The recording interval is five minutes."),
  p("Unit testing is in week one, integration in week two and acceptance in week three.", "Integration is planned for week two", ["Acceptance is in week one", "There are four tests", "Unit testing is in week three"], "Integration is assigned to week two."),
  p("The survey received 240 responses: 65% preferred online sessions and the rest preferred in-person sessions.", "65% preferred online sessions", ["Everyone preferred online sessions", "There were 420 responses", "35% preferred online sessions"], "The stated online preference is 65%."),
  p("The policy begins on 1 July. Declarations are due by 20 June and a briefing is on 25 June.", "Declarations are due by 20 June", ["The policy begins in June", "The briefing is on 20 June", "Declarations are due in July"], "The declaration deadline is 20 June."),
];

const readingBuilders: PracticeBuilder[] = [
  (v,a) => a(reading[v].text, reading[v].correct, reading[v].wrong, reading[v].why),
  (v,a) => a(inference[v].text, inference[v].correct, inference[v].wrong, inference[v].why),
  (v,a) => a(tone[v].text, tone[v].correct, tone[v].wrong, tone[v].why),
  (v,a) => a(context[v].text, context[v].correct, context[v].wrong, context[v].why),
  (v,a) => a(recall[v].text, recall[v].correct, recall[v].wrong, recall[v].why),
  (v,a) => a(`Which statement best summarises the passage? ${reading[v].text}`, reading[v].correct, reading[v].wrong, reading[v].why),
  (v,a) => a(`Which claim goes beyond the evidence? ${inference[v].text}`, inference[v].wrong[0], [inference[v].correct, ...inference[v].wrong.slice(1)], "An inference must remain supported by the passage."),
  (v,a) => a(`Which attitude is justified by the wording? ${tone[v].text}`, tone[v].correct, tone[v].wrong, tone[v].why),
  (v,a) => a(`Which detail was NOT stated? ${recall[v].text}`, recall[v].wrong[0], [recall[v].correct, ...recall[v].wrong.slice(1)], "Compare exact dates, quantities and numbers with the passage."),
  (v,a) => a(`Which contextual meaning is supported? ${context[v].text}`, context[v].correct, context[v].wrong, context[v].why),
];

const stories = [
  ["The council opened a library.", "Students began visiting after classes.", "They requested longer evening hours.", "The council extended the opening hours."],
  ["The office introduced a cycle scheme.", "Several employees signed up.", "Bicycle commuting increased in the first month.", "The office reviewed bicycle parking."],
  ["The city launched a recycling programme.", "Workers found less contamination in sorted bins.", "The quality of collected material improved.", "The city expanded the programme."],
  ["The students began an error-log routine.", "They identified recurring mistakes.", "They repeated those question types the following week.", "Their accuracy improved over the next month."],
  ["The team reviewed the project before release.", "The review revealed gaps in test coverage.", "The team added a regression-test checklist.", "Release defects declined."],
];
const paraBuilders: PracticeBuilder[] = Array.from({ length: 10 }, (_, family) => (v, a) => {
  const s = stories[family % 5];
  const labels = ["A", "B", "C", "D"];
  if (family < 5) {
    const correct = s.map((text, i) => `${labels[i]}. ${text}`).join(" ");
    const wrong = [[s[1],s[0],s[2],s[3]],[s[2],s[1],s[0],s[3]],[s[0],s[2],s[3],s[1]]].map(order => order.map((text,i) => `${labels[i]}. ${text}`).join(" "));
    return a(`Arrange the paragraph:\n${s.map((text,i) => `${labels[i]}: ${text}`).join("\n")}`, correct, wrong, `The logical order is A → B → C → D: ${s.join(" ")}`);
  }
  return a(`Which sentence should immediately follow the opener?\nA: ${s[0]}\nB: ${s[1]}\nC: ${s[2]}\nD: ${s[3]}`, `B. ${s[1]}`, [`A. ${s[0]}`,`C. ${s[2]}`,`D. ${s[3]}`], "The opener introduces the initiative; B gives its immediate consequence before the later details and outcome.");
});

const emailSubjects = ["a delayed report", "a workshop invitation", "a budget approval", "a completed task", "a revised meeting time"];
const emailBuilders: PracticeBuilder[] = Array.from({ length: 10 }, (_, family) => (v, a) => {
  const scenario = emailSubjects[v];
  if (family < 5) {
    const correct = ["Subject: Project update\nDear Ms. Rao,\nThe report deadline has moved to Friday. Please confirm the revised date.\nThank you.\nRegards,\nAnil", "Subject: Workshop invitation\nDear team,\nPlease attend the workshop on Tuesday at 10 am.\nThank you.\nRegards,\nRiya", "Subject: Budget approval\nDear Mr. Shah,\nPlease approve the attached revised budget by Friday.\nThank you.\nRegards,\nMeera", "Subject: Task completion\nDear Ms. Rao,\nThe task is complete and the report is attached.\nThank you.\nRegards,\nKiran", "Subject: Revised meeting time\nDear team,\nThe review has moved to Thursday at 2 pm. Please update your calendars.\nThank you.\nRegards,\nAnil"][v];
    return a(`Which email structure is best for ${scenario}?`, correct, ["Regards\nSubject: Project update\nPlease attend the workshop.\nDear team\nThank you", "Dear Ms. Rao\nThank you\nRegards\nPlease approve the attached budget", "Subject: Task completion\nRegards\nThe task is complete.\nDear Ms. Rao\nThank you", "Dear team\nThe meeting time has changed.\nThank you\nRegards\nSubject: Project update"], "Use subject → salutation → context/request → thank-you → sign-off.");
  }
  const correct = ["I am writing to request the latest project update.", "I would like to invite you to Tuesday's workshop.", "Please approve the attached revised budget.", "The testing task is complete and the report is attached.", "The review has moved to Thursday at 2 pm."][v];
  const prompts = ["request a status update", "invite a colleague", "request approval", "report task completion", "announce a new meeting time"];
  return a(`Choose the clearest professional opening for a message that will ${prompts[v]}.`, correct, ["Send me everything immediately.", "You must act now without further information.", "This message has no purpose and no requested action."], "State the purpose directly and politely, including the relevant action or information.");
});

export const verbalBuilders: Record<string, PracticeBuilder[]> = {
  ...wordChapters,
  "reading-comprehension-passage-recall": readingBuilders,
  "para-jumbles-sentence-arrangement": paraBuilders,
  "email-writing-communication": emailBuilders,
};
