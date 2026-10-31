# Personal Finance

Gestão financeira para personal trainers. React + Vite, dados no Firebase Firestore e publicação na Vercel.

## Versão reconstruída

- Painel responsivo com recebimentos, saldo, reserva, projeção e valores vencidos separados de valores a vencer.
- Busca de alunos, filtros de pagamento, cadastro individual e em dupla.
- Despesas avulsas, fixas e parceladas, histórico e planejamento mantidos.
- Backup JSON pelo cabeçalho (contém dados financeiros; guarde em lugar privado). A importação/restauração não está implementada.
- Confirmação antes de remover cadastros, validação de valores e vencimentos.
- Estado de sincronização, tratamento de erro e tentativa manual de salvar novamente.

## Executar

```sh
npm ci
npm run dev
npm run build
node --test tests/finance.test.mjs
```

Configure na Vercel ou no arquivo local `.env.local` as mesmas variáveis `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID` e `VITE_FIREBASE_APP_ID` já usadas na produção. Não commite arquivos de ambiente.

Para uma prévia isolada: `VITE_DEMO_MODE=true npm run dev`. Usa a lista inicial do código como exemplo, sem ler nem escrever no Firebase. Não configure esse modo no deploy de produção.

## Compatibilidade de dados

O documento existente continua sendo `dados/estado`. O aplicativo carrega `alunos`, `despesas`, `orcamento`, `historico`, `reserva` e `pendencias` desse documento. A lista `initialAlunos` não é a carteira atual: serve somente como referência/fallback e para demonstração. Documento inexistente gera erro e não cria automaticamente uma carteira antiga. As gravações usam merge para preservar campos desconhecidos.

Não é necessária uma migração do banco. A branch de revisão não altera o aplicativo publicado. Antes de colocar em produção: baixar backup no app atual e verificar o deploy de prévia da Vercel com as variáveis do projeto correto.

## Limites e segurança

Este repositório ainda não implementa autenticação. As regras do Firestore não estão versionadas aqui e não foram auditadas. A chave pública de configuração Firebase não substitui controle de acesso. Adicionar login exige configurar um provedor de identidade e regras no projeto Firebase; não há uma senha fictícia nesta versão.

O modelo continua sendo um documento compartilhado. Edições simultâneas em dispositivos podem se sobrepor; não se trata de uma implementação de transações por cadastro. A indicação de salvamento informa a resposta do SDK, sem garantir resolução de conflitos. Não feche a página enquanto ela indicar salvamento ou erro.

O fechamento de mês mantém o comportamento existente: arquiva o mês do calendário e redefine pagamentos. Não há controle de competência independente, bloqueio de segundo fechamento no mesmo mês nem migração automática de alunos inativos. Confira os dados antes de fechar.

## Verificação

Testes automatizados cobrem pagamentos parciais em dupla, vencimento, renovação de despesas e projeção. O build de produção valida a compilação. Integração com o Firebase real exige ambiente configurado; os testes não acessam nem alteram dados de produção.

## Login e pagamentos (nova revisão)
Login por e-mail/senha implementado. Antes de publicar: habilitar Email/Password no Firebase Authentication, criar sua conta no console, copiar o UID para VITE_OWNER_UID na Vercel e publicar regras equivalentes a firestore.rules.example com o mesmo UID. Não publique a regra de exemplo sem substituir o marcador. Não compartilhe sua senha. A autorização real deve ser aplicada nas regras, não apenas na interface. Sem UID configurado, o app bloqueia o acesso.

Forma de pagamento é registrada por cadastro e, em dupla, separadamente para cada pessoa. Não marca o pagamento como recebido automaticamente. Fica no histórico ao fechar o mês e é limpa para o seguinte. Pagamentos antigos ficam como Não informado; não são inferidos. Ainda não há múltiplas formas de pagamento por pessoa no mesmo mês.
