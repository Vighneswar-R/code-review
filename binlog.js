const MySQLEvents = require("@rodrigogs/mysql-events");
 
const binLogQueries = require('./infrastructure/DB/binLogQueries');
 
const {emitBinlog } = require('./infrastructure/socket/binLogBus')
 
const {add,currentVersion} = require('./changestore');
 
let masterTableVersion = 0;
 
module.exports = async function startBinlog() {
  const dbUrl = new URL(process.env.DATABASE_URL);
 
  const instance = new MySQLEvents(
    {
      host: dbUrl.hostname,
      user: decodeURIComponent(dbUrl.username),
      password: decodeURIComponent(dbUrl.password),
    },
    {
      startAtEnd: true
    }
  );
 
  await instance.start();
 
  instance.addTrigger({
    name: "master_table_trigger",
    expression: "i_collect_uat.PermissionMapping",
    statement: MySQLEvents.STATEMENTS.ALL,
    onEvent: async event => {
      masterTableVersion++;
      console.log(
        "? Master table changed | Version:",
        masterTableVersion
      );
        console.log(JSON.stringify(event), { depth: null });
 
    const result = await binLogQueries.getChangeInfo(event?.["affectedRows"]?.[0]?.["after"]);
 
 
     emitBinlog({
        source: 'permissionmapping',
        action: event.type,
        data: result,
        raw: event,
        ts: Date.now(),
      });
 
     
    console.log(result);
 
    }
  });
 
  console.log("?? Binlog listener started");
};
 
module.exports.getVersion = () => masterTableVersion;
 
 