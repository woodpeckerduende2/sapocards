// Presentation-only localization. Authored decks, cards, code and answers are never translated.
export const LANGUAGE_KEY = 'sapocards.language';
let selectedLanguage = 'pt-BR';
try { if (localStorage.getItem(LANGUAGE_KEY) === 'en') selectedLanguage = 'en'; } catch {}
export const language = () => selectedLanguage;
export const locale = () => selectedLanguage === 'en' ? 'en-US' : 'pt-BR';
export function setLanguage(value) {
  if (!['pt-BR', 'en'].includes(value)) return;
  selectedLanguage = value;
  try { localStorage.setItem(LANGUAGE_KEY, value); } catch {}
}
export function content(value) {
  const escaped = String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return `<span translate="no" data-study-content>${escaped}</span>`;
}
const entries = `
Idioma do conteúdo|Content language
Sintaxe, tipos e operações|Syntax, types and operations
Decisões, repetição, arrays e métodos|Decisions, loops, arrays and methods
Objetos, texto, entrada e erros|Objects, text, input and errors
Formato de arquivo inválido. Importe um backup do Sapocards.|Invalid file format. Import a Sapocards backup.
O arquivo ultrapassa os limites desta versão.|The file exceeds this version's limits.
Marcas de conteúdo inválidas.|Invalid content pack markers.
Preferências inválidas.|Invalid preferences.
Tema inválido.|Invalid theme.
Ordem dos baralhos inválida.|Invalid deck order.
O arquivo contém um baralho inválido.|The file contains an invalid deck.
O arquivo contém um cartão inválido.|The file contains an invalid card.
Respostas aceitas do cartão inválidas.|Invalid accepted answers for a card.
Termo do cartão inválido.|Invalid card term.
Tema do cartão inválido.|Invalid card topic.
Exemplo do cartão inválido.|Invalid card example.
Atividades do cartão inválidas.|Invalid card activities.
Atividade do cartão inválida.|Invalid card activity.
Progresso de revisão inválido.|Invalid review progress.
Histórico inválido.|Invalid history.
Progresso das lições inválido.|Invalid lesson progress.
Exercício da lição inválido.|Invalid lesson exercise.
Posição da lição inválida.|Invalid lesson position.
Resposta da lição inválida.|Invalid lesson answer.
Lição ativa inválida.|Invalid active lesson.
Cartão removido|Removed card
Níveis relativos a este baralho introdutório. Exercícios de leitura de código com correção prevista; os trechos não são executados no navegador. Referências:|Levels are relative to this introductory deck. Code-reading exercises use predefined answers; snippets are not executed in the browser. References:
e documentação Java SE.|and the Java SE documentation.
Conteúdo do japonês moderno: caracteres básicos, variantes e combinações usuais; também inclui algumas formas raras para reconhecimento. Não inclui kana históricos ゐ / ヰ e ゑ / ヱ, formas especializadas ゕ / ヵ e ゖ / ヶ, nem todas as transcrições estrangeiras possíveis. A dificuldade é uma sequência didática, não um nível JLPT. Leituras conferidas nos guias de|Modern Japanese content: basic characters, variants and common combinations, plus a few rare forms for recognition. Excludes historical kana ゐ / ヰ and ゑ / ヱ, specialized forms ゕ / ヵ and ゖ / ヶ, and some foreign-word transcriptions. Difficulty follows a learning sequence, not a JLPT level. Readings checked against the guides to
da Tofugu.|by Tofugu.
Idioma do site|Site language
Início|Home
Meus baralhos|My decks
Revisar|Review
Meu progresso|My progress
Ajustes|Settings
Baralhos|Decks
Progresso|Progress
Seu espaço de estudo|Your study space
Principal|Main navigation
Principal no celular|Mobile navigation
Criar baralho|Create deck
Um salto por dia.|One leap a day.
Pequenas revisões. Grandes descobertas. Vá no seu ritmo.|Small reviews. Big discoveries. Go at your own pace.
Configurações|Settings
Meu espaço|My space
Salvo neste navegador|Saved in this browser
Buscar baralhos|Search decks
Buscar nos seus baralhos...|Search your decks...
Seu ritmo, seu progresso|Your pace, your progress
Ativar modo claro|Switch to light mode
Ativar modo escuro|Switch to dark mode
Seu estudo está esperando por você.|Your study is waiting for you.
Sua lição está salva. Continue no seu ritmo.|Your lesson is saved. Continue at your own pace.
Continuar de onde parei|Pick up where I left off
Feito para aprender. Um cartão de cada vez.|Made for learning. One card at a time.
Sapocards · versão 0.9.5|Sapocards · version 0.9.5
Vamos dar o próximo salto?|Ready for your next leap?
Um pouquinho hoje faz toda a diferença amanhã.|A little today makes all the difference tomorrow.
Um bom dia para aprender|A good day to learn
Pequenos passos, memória em dia|Small steps, lasting memories
O que você vai|What will you
 descobrir hoje?| discover today?
descobrir hoje?|discover today?
Seu conhecimento merece ficar. Separe alguns minutos e reencontre o que aprendeu.|Your knowledge deserves to stay. Take a few minutes to revisit what you have learned.
Começar a revisar|Start reviewing
Para revisar|Due for review
Prontos para hoje|Ready for today
Revisões hoje|Reviews today
Cada revisão conta|Every review counts
Cartões criados|Cards created
Conhecimento organizado|Knowledge organized
Seus baralhos|Your decks
Um mundo para explorar|A world to explore
Minha coleção|My collection
Ver todos|View all
Filtrar por categoria|Filter by category
Todas as categorias|All categories
Filtrar baralhos|Filter decks
Todos os baralhos|All decks
Favoritos|Favorites
Nenhum baralho por aqui.|No decks here yet.
Crie um baralho ou ajuste sua busca e os filtros.|Create a deck or adjust your search and filters.
Um novo conhecimento|Something new to learn
Crie seu próximo baralho|Create your next deck
Abrir baralho|Open deck
Constância vale mais que pressa.|Consistency matters more than speed.
Meta de hoje|Today's goal
Seu conhecimento, organizado.|Your knowledge, organized.
Um lugar para cada assunto. Um cartão para cada descoberta.|A place for every subject. A card for every discovery.
Pergunta|Question
Resposta|Answer
Novo|New
Revisão disponível|Review available
Editar baralho|Edit deck
Excluir baralho|Delete deck
Voltar aos baralhos|Back to decks
Baralho não encontrado.|Deck not found.
Aprender em lições|Learn in lessons
Praticar digitando|Typing practice
Um nível de cada vez|One level at a time
Escolha uma etapa para consultar os cartões e estudar apenas esse conteúdo.|Choose a level to browse its cards and study that content.
Dificuldade dos cartões|Card difficulty
Iniciante|Beginner
Intermediário|Intermediate
Avançado|Advanced
Sem nível|Unassigned
Caracteres básicos · gojūon|Basic characters · gojūon
Dakuten e handakuten · sons com marcas|Dakuten and handakuten · marked sounds
Combinações e formas especiais|Combinations and special forms
Cartões sem dificuldade definida|Cards with no assigned difficulty
Todos os níveis|All levels
Todos|All
Filtrar cartões por dificuldade|Filter cards by difficulty
Cartões|Cards
Adicionar cartão|Add card
Pesquisar cartões neste baralho|Search cards in this deck
Buscar na pergunta ou na resposta…|Search questions or answers…
Limpar|Clear
Nenhum cartão encontrado.|No cards found.
Altere a busca, limpe o campo ou escolha outro nível.|Change the search, clear the field or choose another level.
Ver lições deste nível|View lessons for this level
Estudar este nível|Study this level
Aprenda em pequenas lições de cerca de 3 minutos. A duração é uma estimativa: avance no seu ritmo, sem cronômetro.|Learn in short lessons of about 3 minutes. This is an estimate: go at your own pace, with no timer.
Seu momento de revisão|Your review time
Uma sessão curta também é um bom avanço.|A short session is a good step forward, too.
Etapa pausada. Vá no seu ritmo.|Step paused. Go at your own pace.
Etapa concluída. Bom salto!|Step complete. Nice leap!
Vamos colocar a memória em movimento?|Ready to give your memory a workout?
Revisão diária|Daily review
Seu estudo|Your study
Pode descansar. A próxima parte continuará de onde você parou, inclusive depois de fechar a página.|Take a break. The next part will pick up where you left off, even after you close the page.
Você chegou ao fim da fila deste estudo. As próximas revisões seguirão o agendamento.|You have reached the end of this study queue. Future reviews will follow the schedule.
Próxima etapa|Next step
Revisar cartões disponíveis|Review available cards
Começar revisão diária|Start daily review
Descansar e sair|Take a break and exit
Escolher um baralho|Choose a deck
Agendamento experimental: Errei · 10 min; Difícil · 1 dia;|Experimental schedule: Again · 10 min; Hard · 1 day;
Bom · a partir de 2 dias; Fácil · a partir de 4 dias.|Good · at least 2 days; Easy · at least 4 days.
Cartão indisponível. Volte aos baralhos.|Card unavailable. Return to your decks.
Pausar e sair|Pause and exit
Prática digitada|Typing practice
Revisão|Review
Como foi lembrar? A avaliação é sua.|How well did you remember? You decide.
Errei|Again
Difícil|Hard
Bom|Good
Fácil|Easy
Ver pergunta novamente|Show question again
Revelar resposta|Reveal answer
Espaço|Space
Tente responder antes de revelar. Não precisa ter pressa.|Try answering before revealing. Take your time.
Encerrar etapa agora|End step now
Desfazer última avaliação|Undo last rating
Restaura a pergunta, o agendamento e a posição anterior.|Restores the question, schedule and previous position.
Um cartão sem avaliação fica salvo para a retomada.|An unrated card is saved so you can return to it.
Progresso salvo a cada avaliação. Ao errar, o cartão volta uma vez ao fim desta sessão. Nova revisão em 10 minutos.|Progress is saved after each rating. A missed card returns once at the end of this session. Review again in 10 minutes.
Intervalos experimentais; as avaliações representam sua percepção de lembrança.|Experimental intervals; ratings reflect how well you feel you remembered.
Resposta aceita!|Answer accepted!
Vamos conferir a resposta.|Let's check the answer.
Você digitou:|You typed:
Respostas aceitas:|Accepted answers:
Conferência automática. Avalie abaixo sua lembrança para agendar a próxima revisão.|Automatically checked. Rate your recall below to schedule your next review.
Leitura em romaji|Reading in romaji
Sua resposta|Your answer
Digite sua resposta|Type your answer
Maiúsculas, espaços nas extremidades e ponto final não mudam a correção. Use uma resposta curta.|Capitalization, leading or trailing spaces and a final period do not affect checking. Use a short answer.
Conferir resposta|Check answer
Você tem um estudo salvo|You have a saved study session
Você pode retomar esse estudo ou trocar de baralho, nível ou modo. Trocar descarta a fila salva; todas as avaliações concluídas continuam registradas.|Resume this session or switch decks, levels or modes. Switching discards the saved queue; all completed ratings remain recorded.
Cancelar|Cancel
Trocar estudo|Switch session
Retomar estudo salvo|Resume saved session
Voltar ao baralho|Back to deck
Voltar às lições|Back to lessons
Um pequeno salto por lição.|A small leap with each lesson.
Observe · compare · pratique|Observe · compare · practice
Parecidos no traço.|Similar in shape.
Diferentes na memória.|Distinct in memory.
Pequenos grupos para aprender a distinguir os caracteres.|Small groups to help you tell characters apart.
Cerca de 3 minutos por lição, com liberdade para levar o tempo que precisar.|About 3 minutes per lesson, with the freedom to take as long as you need.
Um detalhe faz a diferença.|One detail makes a difference.
Nível das lições|Lesson level
Sua trilha de aprendizado|Your learning path
Concluída. Volte quando quiser praticar.|Completed. Come back whenever you want to practice.
Em andamento. Sua posição está salva.|In progress. Your position is saved.
Praticar novamente|Practice again
Continuar lição|Continue lesson
Conhecer os caracteres|Meet the characters
A duração é apenas uma estimativa. O progresso avança pelos exercícios concluídos. Os grupos são uma organização didática de semelhanças e contrastes; formas complementares aparecem em pequenas lições para cobrir todo o baralho.|Duration is only an estimate. Progress advances with completed exercises. Groups highlight similarities and contrasts; additional forms appear in short lessons covering the entire deck.
Abrir lição|Open lesson
Esta lição foi alterada. Volte aos baralhos para escolher uma lição.|This lesson has changed. Return to your decks to choose a lesson.
Primeiro, observe as diferenças|First, notice the differences
Olhe para o contorno, compare os detalhes e leia cada som.|Look at the shape, compare the details and read each sound.
Depois você vai reconhecer as leituras e encontrar os caracteres. Pode consultar esta apresentação novamente quando quiser.|Next, identify readings and find characters. You can revisit this introduction whenever you like.
Começar prática|Start practice
Uma lição curta, no seu ritmo. Seu avanço fica salvo.|A short lesson at your own pace. Your progress is saved.
Mais um salto no aprendizado|Another leap in learning
Lição concluída!|Lesson complete!
Os erros também ajudam a perceber as diferenças.|Mistakes also help you notice the differences.
Próxima lição|Next lesson
Ver minha trilha|View my learning path
Concluir a lição registra a prática. Revisitar o conteúdo ajuda a acompanhar sua lembrança ao longo do tempo.|Completing the lesson records your practice. Revisit the content to track your recall over time.
Exercício indisponível. Volte à trilha de lições.|Exercise unavailable. Return to your learning path.
Exercício indisponível.|Exercise unavailable.
Vamos observar mais uma vez|Let's look once more
Encontre o caractere|Find the character
Reconheça a leitura|Identify the reading
Qual destes caracteres corresponde à leitura?|Which character matches this reading?
Como se lê este caractere?|How is this character read?
Isso mesmo. Bom salto!|That's right. Nice leap!
Um detalhe para lembrar.|A detail to remember.
Continue no seu ritmo.|Keep going at your own pace.
A resposta é|The answer is
Você pode praticar esta lição novamente depois.|You can practice this lesson again later.
Este exercício vai aparecer mais uma vez ao final.|This exercise will appear once more at the end.
Concluir lição|Finish lesson
Continuar|Continue
Compare com calma. O avanço acontece uma resposta por vez.|Take your time to compare. Progress happens one answer at a time.
Rever os caracteres da lição|Review the lesson's characters
Seu primeiro salto em Java.|Your first leap into Java.
Entenda · leia · pratique|Understand · read · practice
Uma ideia de cada vez.|One idea at a time.
Um programa tomando forma.|A program taking shape.
12 lições curtas, do primeiro println aos objetos.|12 short lessons, from your first println to objects.
Cerca de 3 minutos por lição, no seu ritmo.|About 3 minutes per lesson, at your own pace.
Concluída. Reforce os conceitos quando quiser.|Completed. Reinforce the concepts whenever you like.
Em andamento. Seu avanço está salvo.|In progress. Your progress is saved.
Conhecer os conceitos|Meet the concepts
A duração é uma estimativa. Os níveis indicam a sequência dentro desta introdução a Java. Leia os trechos, tente prever o resultado e confira a explicação; os exemplos não são executados no navegador.|Duration is an estimate. Levels show the sequence within this Java introduction. Read the snippets, predict the result and check the explanation; examples are not executed in the browser.
Primeiro, conheça as ideias|First, get to know the ideas
Leia o código e explique a ideia com suas palavras.|Read the code and explain the idea in your own words.
Na prática, você vai escolher conceitos, reconhecer sintaxe e prever resultados. Pode rever esta apresentação a qualquer momento.|In practice, choose concepts, identify syntax and predict results. You can revisit this introduction at any time.
Uma lição curta, no seu ritmo. Sem cronômetro.|A short lesson, at your own pace. No timer.
Mais uma ideia para colocar em prática|Another idea to put into practice
Seu progresso está salvo.|Your progress is saved.
Experimente escrever e executar os exemplos no seu ambiente Java para consolidar o que aprendeu.|Try writing and running the examples in your Java environment to reinforce what you learned.
Vamos revisar esta ideia|Let's revisit this idea
Leia o código|Read the code
Reconheça o conceito|Identify the concept
Vamos entender este detalhe.|Let's understand this detail.
Resposta:|Answer:
Esta atividade reaparecerá uma vez ao final.|This activity will appear once more at the end.
Responda com calma. O avanço acontece uma atividade por vez.|Take your time to answer. Progress happens one activity at a time.
Rever os conceitos da lição|Review the lesson's concepts
Trecho didático para leitura; o código não é executado no navegador.|A learning snippet for reading; code is not executed in the browser.
Cada revisão é um avanço.|Every review is a step forward.
Acompanhe sua atividade, sem transformar o estudo em uma corrida.|Track your activity without turning studying into a race.
Avaliações registradas|Recorded ratings
Cartões já estudados|Cards studied
Seus últimos 7 dias|Your last 7 days
Número de avaliações em cada dia.|Number of ratings each day.
Como você avaliou|How you rated
Autoavaliações feitas no modo de revisão.|Self-ratings made in review mode.
Este gráfico contém somente autoavaliações. Exercícios de lições e de digitação têm correção automática e aparecem identificados no histórico.|This chart includes only self-ratings. Lesson and typing exercises are checked automatically and labeled in your history.
Histórico recente|Recent history
Seu histórico aparecerá depois da primeira revisão.|Your history will appear after your first review.
Acerto na digitação|Correct typed answer
Rever na digitação|Review typed answer
Acerto na lição|Correct lesson answer
Rever na lição|Review lesson answer
Seu espaço, do seu jeito.|Your space, your way.
Cuide das suas preferências e mantenha uma cópia do que aprendeu.|Manage your preferences and keep a copy of what you have learned.
Aparência|Appearance
Tema do site|Site theme
Claro|Light
Escuro|Dark
Usar tema do dispositivo|Use device theme
Salvo automaticamente. Alterne também pelo ícone no topo.|Saved automatically. You can also use the icon at the top.
Restaurar ordem original dos baralhos|Restore original deck order
Ritmo de estudo|Study pace
Meta diária de revisões|Daily review goal
Uma referência para sua rotina. A meta não limita a sessão.|A guide for your routine. The goal does not limit your session.
Salvar preferência|Save preference
Como funciona o agendamento?|How does scheduling work?
Errei:|Again:
Difícil:|Hard:
Bom:|Good:
Fácil:|Easy:
10 minutos e uma repetição na sessão.|10 minutes and one repeat in the session.
1 dia.|1 day.
ao menos 2 dias.|at least 2 days.
ao menos 4 dias.|at least 4 days.
Bom e Fácil ampliam o intervalo anterior. Cartões atrasados permanecem disponíveis. Cada avaliação inicia um novo intervalo a partir daquele momento.|Good and Easy extend the previous interval. Overdue cards remain available. Each rating starts a new interval from that moment.
As estatísticas diárias usam o horário local do dispositivo, com início à meia-noite. Editar um cartão mantém seu progresso.|Daily statistics use your device's local time, starting at midnight. Editing a card preserves its progress.
Pronúncia japonesa|Japanese pronunciation
Experimental|Experimental
Ouça hiragana e katakana com a voz do navegador. A disponibilidade e a pronúncia variam entre dispositivos, especialmente em caracteres pequenos e formas isoladas.|Listen to hiragana and katakana using your browser's voice. Availability and pronunciation vary by device, especially for small characters and isolated forms.
Reprodução após responder|Playback after answering
Automática e pelo botão Ouvir|Automatically and with the Listen button
Somente pelo botão Ouvir|Only with the Listen button
Testar voz · あ|Test voice · あ
Ouvir pronúncia|Listen to pronunciation
Seus dados em segurança|Keep your data safe
Os dados ficam apenas neste navegador e dispositivo. Limpar os dados do site pode removê-los. Exporte uma cópia regularmente.|Data is stored only in this browser and device. Clearing site data may remove it. Export a copy regularly.
Exportar dados|Export data
Importar cópia|Import backup
A importação substitui todos os dados atuais após validação e confirmação.|Importing replaces all current data after validation and confirmation.
Sobre o Sapocards|About Sapocards
Uma plataforma para organizar o que você aprende e reencontrar esse conhecimento aos poucos. Versão inicial com JavaScript e Tailwind CSS.|A platform to organize what you learn and revisit that knowledge gradually. An early version built with JavaScript and Tailwind CSS.
Os baralhos iniciais são exemplos editáveis. O mascote e o nome são provisórios, com inspiração no universo Sapobobo.|Starter decks are editable examples. The mascot and name are provisional, inspired by the Sapobobo universe.
Agendamento experimental · v0.9.5|Experimental scheduling · v0.9.5
Fechar|Close
Dê um lar ao que você quer aprender.|Give what you want to learn a home.
Nome do baralho|Deck name
Ex.: Português para concursos|E.g.: Portuguese for exams
Descrição|Description
(opcional)|(optional)
O que você vai estudar?|What will you study?
Categoria|Category
Cor do baralho|Deck color
Verde|Green
Amarelo|Yellow
Lilás|Lilac
Azul|Blue
Salvar alterações|Save changes
Editar cartão|Edit card
Criar um cartão|Create a card
Uma pergunta clara. Uma resposta que faz sentido.|A clear question. An answer that makes sense.
Frente · pergunta|Front · question
Verso · resposta|Back · answer
O que você quer lembrar?|What do you want to remember?
Escreva uma resposta objetiva.|Write a concise answer.
Respostas aceitas na digitação|Accepted typed answers
Uma resposta por linha|One answer per line
Uma alternativa por linha, até 20 respostas. Em kana, deixar vazio usa a leitura do cartão e variantes comuns de romaji. Em Japonês do dia a dia, preencha para habilitar a digitação.|One alternative per line, up to 20 answers. For kana, leave blank to use the card's reading and common romaji variants. For Everyday Japanese, fill this in to enable typing.
Dificuldade do conteúdo|Content difficulty
Classificação do conteúdo; a avaliação de lembrança é feita durante a revisão.|Content classification; recall is rated during review.
A edição mantém o progresso existente.|Editing preserves existing progress.
Salvar cartão|Save card
Excluir este cartão?|Delete this card?
O cartão, seu progresso e seu histórico serão removidos. Essa ação não pode ser desfeita.|The card, its progress and its history will be removed. This action cannot be undone.
Excluir cartão|Delete card
Substituir os dados atuais?|Replace current data?
Importar e substituir|Import and replace
Esta avaliação não pode mais ser desfeita.|This rating can no longer be undone.
Última avaliação desfeita. A pergunta está pronta para responder novamente.|Last rating undone. The question is ready to answer again.
Não foi possível salvar. Exporte seus dados e verifique o espaço do navegador.|Unable to save. Export your data and check your browser's storage space.
Nenhum cartão com resposta curta configurada neste nível. Configure as respostas aceitas no editor do cartão.|No cards have short answers configured at this level. Set accepted answers in the card editor.
Nenhum cartão disponível. Adicione cartões ou escolha o estudo livre.|No cards available. Add cards or choose free study.
Preencha o nome do baralho.|Enter a deck name.
Baralho atualizado.|Deck updated.
Seu baralho está pronto. Adicione o primeiro cartão!|Your deck is ready. Add your first card!
Use até 20 respostas com no máximo 500 caracteres cada.|Use up to 20 answers with a maximum of 500 characters each.
Preencha a pergunta e a resposta.|Enter the question and answer.
Cartão salvo.|Card saved.
Arquivo muito grande. Limite: 15 MB.|File too large. Limit: 15 MB.
Dados importados com sucesso.|Data imported successfully.
Este arquivo não contém JSON válido.|This file does not contain valid JSON.
Cópia exportada. Guarde o arquivo JSON.|Backup exported. Keep the JSON file safe.
Ordem original restaurada.|Original order restored.
Preferência de áudio salva.|Audio preference saved.
Meta atualizada.|Goal updated.
Os dados foram alterados em outra aba. Recarregando o progresso.|Data changed in another tab. Reloading progress.
Não foi possível ler os dados salvos. Importe uma cópia para recuperar seu progresso.|Unable to read saved data. Import a backup to recover your progress.
Este navegador não oferece síntese de voz.|This browser does not support speech synthesis.
Nenhuma voz japonesa disponível. Verifique as vozes do navegador ou instale uma voz japonesa no dispositivo.|No Japanese voice available. Check your browser's voices or install a Japanese voice on your device.
Não foi possível reproduzir a pronúncia. Tente novamente pelo botão Ouvir.|Unable to play pronunciation. Try again using the Listen button.
Não foi possível reproduzir a pronúncia neste navegador.|Unable to play pronunciation in this browser.
Remover dos favoritos|Remove from favorites
Adicionar aos favoritos|Add to favorites
Arrastar para reorganizar · Alt + ← / →|Drag to reorder · Alt + ← / →
`;
const dictionary = Object.fromEntries(entries.trim().split('\n').map(line => line.split('|')));
const patterns = [
  [/^(\d+) cartões$/, '$1 cards'],
  [/^(\d+) para revisar$/, '$1 due for review'],
  [/^(\d+) cartões pendentes na revisão\.$/, '$1 cards pending in your review.'],
  [/^Sua meta é de (\d+) revisões por dia\. Cada tentativa é um passo adiante\.$/, 'Your goal is $1 reviews per day. Every attempt is a step forward.'],
  [/^(\d+) · Pergunta$/, '$1 · Question'],
  [/^Próxima revisão: (.+)$/, 'Next review: $1'],
  [/^Editar cartão (\d+)$/, 'Edit card $1'],
  [/^Excluir cartão (\d+)$/, 'Delete card $1'],
  [/^Revisar (\d+) cart(?:ão|ões)$/, (_, n) => `Review ${n} ${n === '1' ? 'card' : 'cards'}`],
  [/^Estudo livre · (\d+) cart(?:ão|ões)$/, (_, n) => `Free study · ${n} ${n === '1' ? 'card' : 'cards'}`],
  [/^(.+)\. O estudo livre também registra avaliações e atualiza o agendamento\.$/, (_, level) => `${translate(level)}. Free study also records ratings and updates the schedule.`],
  [/^(\d+) cartões · (\d+) disponíveis$/, '$1 cards · $2 available'],
  [/^· (\d+) cartões$/, '· $1 cards'],
  [/^Todos \((\d+)\)$/, 'All ($1)'],
  [/^(\d+) cartões encontrados neste nível\.$/, '$1 cards found at this level.'],
  [/^(\d+) avaliações nesta etapa\. Seu progresso está salvo\.$/, '$1 ratings in this step. Your progress is saved.'],
  [/^Você tem (\d+) cartões disponíveis para revisar\.$/, 'You have $1 cards available to review.'],
  [/^(\d+) cartões para as próximas etapas$/, '$1 cards for the next steps'],
  [/^(\d+) cartões pendentes$/, '$1 cards remaining'],
  [/^(Prática digitada|Revisão) (\d+) · no seu ritmo$/, (_, mode, n) => `${mode === 'Revisão' ? 'Review' : 'Typing practice'} ${n} · at your own pace`],
  [/^(Pergunta|Resposta) · (.+)$/, (_, label, level) => `${dictionary[label]} · ${translate(level)}`],
  [/^(\d+) avaliações concluídas$/, '$1 ratings completed'],
  [/^(\d+) na etapa · (\d+) nas próximas$/, '$1 in this step · $2 in the next steps'],
  [/^(\d+) dias?$/, (_, n) => `${n} ${n === '1' ? 'day' : 'days'}`],
  [/^(\d+ (?:min|dias?)) · tecla (\d+)$/, (_, interval, key) => `${translate(interval)} · key ${key}`],
  [/^(\d+) de (\d+) concluídas$/, '$1 of $2 completed'],
  [/^Lição (\d+) · (.+)$/, (_, n, level) => `Lesson ${n} · ${translate(level)}`],
  [/^(\d+) caracteres · ≈ 3 min$/, '$1 characters · ≈ 3 min'],
  [/^(\d+) cartões · (\d+) atividades · ≈ 3 min$/, '$1 cards · $2 activities · ≈ 3 min'],
  [/^(\d+) de (\d+) (exercícios|atividades)$/, '$1 of $2 exercises'],
  [/^Conceito (\d+)$/, 'Concept $1'],
  [/^Você praticou (\d+) (caracteres|conceitos) e acertou (\d+) de (\d+) tentativas\.$/, (_, n, unit, correct, total) => `You practiced ${n} ${unit === 'caracteres' ? 'characters' : 'concepts'} and got ${correct} of ${total} attempts right.`],
  [/^(Iniciante|Intermediário|Avançado|Sem nível) · ≈ 3 min$/, (_, level) => `${translate(level)} · ≈ 3 min`],
  [/^Voz japonesa: (.+)$/, 'Japanese voice: $1'],
  [/^Ouvir pronúncia de (.+)$/, 'Listen to the pronunciation of $1'],
  [/^Arrastar (.+)$/, 'Drag $1'],
  [/^Posição (\d+) de (\d+)\. Use Alt mais seta para esquerda ou direita para mover pelo teclado\.$/, 'Position $1 of $2. Use Alt plus the left or right arrow to move with the keyboard.'],
  [/^Ordem salva\. (.+) agora está na posição (\d+)\.$/, 'Order saved. $1 is now in position $2.'],
  [/^Excluir “(.+)”\?$/, 'Delete “$1”?'],
  [/^(\d+) cartões, seu progresso e o histórico relacionado serão removidos\. Essa ação não pode ser desfeita\.$/, '$1 cards, their progress and related history will be removed. This action cannot be undone.'],
  [/^A cópia contém (\d+) baralhos e (\d+) cartões\. Os dados atuais serão substituídos\. Exporte uma cópia antes, se quiser preservá-los\.$/, 'This backup contains $1 decks and $2 cards. Current data will be replaced. Export a copy first if you want to keep it.'],
];
export function translate(text) {
  if (language() !== 'en' || typeof text !== 'string') return text;
  const trimmed = text.trim();
  let result = dictionary[trimmed];
  if (result === undefined) {
    for (const [pattern, replacement] of patterns) {
      if (pattern.test(trimmed)) { result = trimmed.replace(pattern, replacement); break; }
    }
  }
  if (result === undefined && /^.+: \d+ avaliações(?:; |$)/.test(trimmed)) result = trimmed.replace(/ avaliações/g, ' ratings');
  return result === undefined ? text : text.replace(trimmed, result);
}
export function languageControl() {
  return `<select id="site-language" class="language-select" aria-label="Idioma do site" title="Português (Brasil) / English"><option value="pt-BR" aria-label="Português (Brasil)" ${language() === 'pt-BR' ? 'selected' : ''}>PT-BR</option><option value="en" ${language() === 'en' ? 'selected' : ''}>English</option></select>`;
}
const originals = new WeakMap();
const originalAttributes = new WeakMap();
export function localize(root) {
  if (!root) return;
  const skip = '[translate="no"], [data-study-content], pre, code, textarea, script, style';
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.parentElement?.closest(skip)) continue;
    if (!originals.has(node)) originals.set(node, node.nodeValue);
    node.nodeValue = translate(originals.get(node));
  }
  for (const el of root.querySelectorAll('[aria-label], [aria-description], [title], [placeholder]')) {
    if (el.closest('[translate="no"], [data-study-content]')) continue;
    if (!originalAttributes.has(el)) originalAttributes.set(el, {});
    const original = originalAttributes.get(el);
    for (const attr of ['aria-label', 'aria-description', 'title', 'placeholder']) {
      if (!el.hasAttribute(attr)) continue;
      original[attr] ??= el.getAttribute(attr);
      el.setAttribute(attr, translate(original[attr]));
    }
  }
  document.documentElement.lang = language() === 'en' ? 'en' : 'pt-BR';
  document.title = language() === 'en' ? 'Sapocards — your next leap' : 'Sapocards — seu próximo salto';
  document.querySelector('meta[name="description"]')?.setAttribute('content', language() === 'en' ? 'Organize your decks and take a small leap in learning every day.' : 'Organize seus baralhos e dê um pequeno salto nos estudos todos os dias.');
}
