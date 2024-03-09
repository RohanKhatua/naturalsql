import Client, { ClientConfig } from 'pg'
import URL from 'url'

export default function Home() {
  const dbURL = 'postgresql://technical:QU7FNWNPNTjdFfzQ_k5WlQ@localhost-3989.7s5.aws-ap-south-1.cockroachlabs.cloud:26257/defaultdb'
  const dbParams = URL.parse(dbURL)

  let username = '';
  let password = '';

  if (dbParams.auth) {
    [username, password] = dbParams.auth.split(':')
  }

  const config: ClientConfig = {
    user: username,
    password: password,
    host: dbParams.hostname ? dbParams.hostname : '',
    port: dbParams.port ? parseInt(dbParams.port) : 5432,
    database: dbParams.pathname ? dbParams.pathname.split('/')[1] : '',
    ssl: {
      rejectUnauthorized: true
    }
  }

  const client = new Client.Client(config);
  client.connect();

  const query = `
  SELECT table_name, column_name, data_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
  ORDER BY table_name, ordinal_position;
  `

  let rows: any[] = [];

  client.query(query, (err, res) => {
    if (err) {
      console.error(err);
      return;
    }
    rows = res.rows;
    client.end();
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {
        rows.length > 0 ?
          <table className="table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2">Table Name</th>
                <th className="px-4 py-2">Column Name</th>
                <th className="px-4 py-2">Data Type</th>
              </tr>
            </thead>
            <tbody>
              {
                rows.map((row, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">{row.table_name}</td>
                    <td className="border px-4 py-2">{row.column_name}</td>
                    <td className="border px-4 py-2">{row.data_type}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          :
          <div>No data found</div>
      }
    </main>
  );
}
