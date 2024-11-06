# Starkbank Challenge - Backend

## Descrição

O objetivo deste desafio é emitir _invoices_ automaticamente para clientes aleatórios a cada três horas. O pagamento das _invoices_ é feito automaticamente pelo sistema, e o status do pagamento deve ser atualizado no banco de dados e automaticamente enviar o dinheiro recebido para a conta bancária da Starkbank.

## Requisitos

- Node.js
- NestJS-Cli
- Prisma-Cli
- PostgreSQL Database

## Instalação

1. Clone o repositório

```bash
git clone
```

2. Instale as dependências

```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis de ambiente:

```bash
DATABASE_URL=""
STARK_API=''
KEY_HTTPS_PATH=""
CERT_HTTPS_PATH=""
PRIVATE_KEY=""
PUBLIC_KEY=""
PROJECT_ID=""
ENVIRONMENT=""
```

4. Crie um arquivo em `src/invoice/examples/people.ts` e adicione os dados que serão gerados os invoices no seguinte formato:

```typescript
const invoices = [
  {
    name: 'John Doe',
    taxId: '01234567890',
    amount: 2000,
  },
];

export default invoices;
```

5. Execute as migrações do banco de dados

```bash
npx prisma migrate dev
```

6. Inicie o servidor

```bash
npm run start:dev
```

**Pontos importantes:** A chave e o certificado HTTPS são necessários pois os webhooks da Starkbank exigem uma conexão segura. O Stark API é a url base do ambiente da starkbank. O Starkbank exige que o ambiente seja especificado, podendo ser `sandbox` ou `production`. O Starkbank também exige que o `PROJECT_ID` seja especificado. A chave privada e pública são necessárias para a autenticação do Starkbank, você deve configurar a chave pública no painel de webhooks da Starkbank.

## Rotas

- `POST /starkbank-callback` - Rota para receber os webhooks da Starkbank
- `GET /` - Rota para verificar se a aplicação está online e retorna um Hello World

### POST /starkbank-callback

#### Payload

Os dois eventos suportados até o momento são `transfer` e `invoice`. Abaixo está um exemplo de payload de um evento de transferência:

```json
{
    "event": {
        "id": "5344245984526336",
        "isDelivered": false,
        "subscription": "transfer",
        "created": "2020-03-11T00:14:23.201602+00:00",
        "log": {
            "id": "5344245984526336",
            "errors": [],
            "type": "success",
            "created": "2020-03-11T00:14:22.104676+00:00",
            "transfer": {
                "id": "5907195937947648",
                "status": "success",
                "amount": 10000000,
                "name": "Jon Snow",
                "bankCode": "001",
                "branchCode": "5897"
                "accountNumber": "10000-0",
                "taxId": "580.822.679-17",
                "tags": ["jon", "snow", "knows-nothing"],
                "created": "2020-03-11T00:14:21.548876+00:00",
                "updated": "2020-03-11T00:14:22.104702+00:00",
                "transactionIds": ["6671637889941504"],
                "fee": 200,
            }
        }
    }
}
```

#### Headers

```json
{
  "Content-Type": "application/json",
  "Digital-Signature": "assinatura digital do body"
}
```

Os webhooks da Starkbank são assinados digitalmente, você deve verificar a assinatura digital do payload para garantir que a requisição é realmente da Starkbank.
Veja mais detalhes sobre os webhooks da Starkbank [aqui](https://starkbank.com/docs/api#security).

#### Resposta

- Status: 200

```json
{
  "message": "RESPOSTA DA REQUISIÇÃO"
}
```

## Testes

Para rodar os testes, execute o seguinte comando:

```bash
npm run test
```

Os testes são essenciais para garantir que a aplicação está funcionando corretamente. Durante o desenvolvimento do projeto, alguns bugs na integração com a Starkbank foram encontrados e corrigidos graças aos testes.

## Deploy

Para fazer o deploy eu utilizei uma instância gratuita da AWS EC2. O deploy foi feito utilizando os procedimentos descritos na documentação do NestJS. Não foi utilizado nenhum serviço de CI/CD e/ou Docker, o deploy foi feito manualmente. O banco de dados utilizado foi o PostgreSQL, também hospedado na AWS RDS.

## Considerações finais

O desafio foi muito interessante e desafiador. A integração com a API da Starkbank foi facilitada pelo uso da SDK deles para NodeJS. A parte mais desafiadora foi a implementação da assinatura digital dos webhooks da Starkbank. A documentação não foi muito clara quanto a como a implementação é realizada e acabei tendo que recorrer a SDK deles, a parte de assinatura eu queria ter feito manualmente, mas não obtive sucesso e devido ao tempo acabei utilizando a SDK deles. A parte de deploy foi tranquila, o mais trabalhoso foi configurar os serviços da AWS, mas o deploy em si foi tranquilo. A parte de testes foi muito importante, pois encontrei alguns bugs na integração com a Starkbank que só foram encontrados graças aos testes.

No entanto, eu tive um problema muito grande com transferências de mesmo valores, ou seja, se dois invoices tiverem o mesmo valor, provavelmente a segunda transferência irá falhar, pois a Starkbank não aceita transferências de mesmo valor em um curto período de tempo. Eu tentei contornar esse problema, mas não obtive sucesso. Eu acredito que a solução para esse problema seria criar um serviço que gerenciasse os invoices e agrupassem os invoices recebidos no dia em uma única transferência para a conta da Starkbank, mas devido ao tempo não consegui implementar essa solução.

## Autor

- [Gabriel Scarpelin](https://www.linkedin.com/in/gabriel-scarpelin-diniz-425258144/)

## Referências

- [NestJS](https://docs.nestjs.com/)
- [Prisma](https://www.prisma.io/)
- [Starkbank](https://starkbank.com/docs/api)
- [AWS](https://docs.aws.amazon.com/)
- Github Copilot - Utilizado para auxiliar na escrita do código
