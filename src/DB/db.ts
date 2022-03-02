import { createConnection, Connection } from "typeorm";
import * as mysql from "mysql";

class Database {
  private static instance: any = null;
  private typeOrmConnenction: Connection;
  private mysqlNativeConnection: mysql.Connection;

  constructor() {

    //database configurations as defined in environment file
    const db = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PWD,
      database: process.env.DB_NAME,
    });
    this.mysqlNativeConnection = db;

    //Handling DB error
    let self = this;
    db.on("error", (error) => {
      const db = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PWD,
        database: process.env.DB_NAME,
      });
      self.mysqlNativeConnection = db;
    });

    //Creating typeorm connection
    createConnection().then(async function (connection) {
      console.log(`Typeorm's connection created successfully`);
    }).catch(function (e) {
      console.log("Db error: ", e);
    });    
  }

  public async getMysqlNativeConnection(): Promise<mysql.Connection> {
    return this.mysqlNativeConnection;
  }

  public static getDBInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
      console.log(`New instance created`);
    }
    return Database.instance;
  }
}

export { Database };
