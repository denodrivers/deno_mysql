import { assertEquals } from "https://deno.land/x/testing/asserts.ts";
import { runTests, test } from "https://deno.land/x/testing/mod.ts";
import { Client } from "./mod.ts";
import "./tests/query.ts";

let client: Client;

test(async function testCreateDb() {
    await client.query(`CREATE DATABASE IF NOT EXISTS enok`);
    await client.query(`USE enok`);
});

test(async function testCreateTable() {
    await client.query(`DROP TABLE IF EXISTS users`);
    await client.query(`
        CREATE TABLE users (
            id int(11) NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            created_at timestamp not null default current_timestamp,
            PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    `);
});

test(async function testInsert() {
    let result = await client.execute(`INSERT INTO users(name) values(?)`, ["manyuanrong"]);
    assertEquals(result, { affectedRows: 1, lastInsertId: 1 });
    result = await client.execute(
        `INSERT INTO users ?? values ?`,
        [["id", "name"], [2, "MySQL"]]
    );
    assertEquals(result, { affectedRows: 1, lastInsertId: 2 });
});

test(async function testUpdate() {
    let result = await client.execute(`update users set ?? = ? WHERE id = ?`, ["name", "MYR", 1]);
    assertEquals(result, { affectedRows: 1, lastInsertId: 0 });
});

test(async function testQuery() {
    let result = await client.query("select ??,name from ?? where id = ?", ["id", "users", 1]);
    assertEquals(result, []);
});

test(async function testDelete() {
    let result = await client.execute(`delete from users where ?? = ?`, ["id", 1]);
    assertEquals(result, { affectedRows: 1, lastInsertId: 0 });
});

async function main() {
    client = await new Client().connect({
        debug: true,
        hostname: "127.0.0.1",
        username: "root",
        db: "",
        password: "Gao437081"
    });
    runTests();
}

main();