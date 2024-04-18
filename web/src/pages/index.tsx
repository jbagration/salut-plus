import { useState, useMemo } from "react";
import Head from "next/head";
import { Inter } from "next/font/google";
import Table from "react-bootstrap/Table";
import { Alert, Container } from "react-bootstrap";
import { GetServerSideProps, GetServerSidePropsContext } from "next";

const inter = Inter({ subsets: ["latin"] });

type TUserItem = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  updatedAt: string;
};

type TGetServerSideProps = {
  statusCode: number;
  users: TUserItem[];
};

export const getServerSideProps: GetServerSideProps<TGetServerSideProps> = async (
  ctx: GetServerSidePropsContext
) => {
  try {
    const res = await fetch("http://localhost:3000/users", { method: "GET" });
    if (!res.ok) {
      return { props: { statusCode: res.status, users: [] } };
    }

    return {
      props: { statusCode: 200, users: await res.json() },
    };
  } catch (e) {
    return { props: { statusCode: 500, users: [] } };
  }
};

function Pagination({ totalPages, currentPage, setCurrentPage }: { totalPages: number; currentPage: number; setCurrentPage: (page: number) => void }) {
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const pageRange = useMemo(() => {
    const rangeSize = 10; 
    const midPoint = Math.ceil(rangeSize / 2);
    let start = Math.max(1, currentPage - midPoint + 1);
    let end = Math.min(totalPages, start + rangeSize - 1);

    if (end - start < rangeSize) {
      start = Math.max(1, end - rangeSize + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  const goToPrevRange = () => {
    setCurrentPage(1);
  };
  
  const goToNextRange = () => {
    setCurrentPage(totalPages);
  };
  
  return (
    <nav>
      <ul className="pagination">
        <li className="page-item">
          <button className="page-link" onClick={goToPrevRange} disabled={currentPage <= 1}>
            &laquo;
          </button>
        </li>
        <li className="page-item">
          <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage <= 1}>
          &lsaquo;
          </button>
        </li>
        {pageRange.map((pageNumber) => (
          <li key={pageNumber} className={`page-item ${pageNumber === currentPage ? 'active' : ''}`}>
            <button className="page-link" onClick={() => goToPage(pageNumber)}>
              {pageNumber}
            </button>
          </li>
        ))}
        <li className="page-item">
          <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages}>
          &rsaquo;
          </button>
        </li>
        <li className="page-item">
          <button className="page-link" onClick={goToNextRange} disabled={currentPage + 10 > totalPages}>
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default function Home({ statusCode, users }: TGetServerSideProps) {
  if (statusCode !== 200) {
    return (
      <Alert variant={"danger"}>
        Ошибка {statusCode} при загрузке данных
      </Alert>
    );
  }

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;
  const totalPages = Math.ceil(users.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = Math.min(startIndex + usersPerPage, users.length);
  const currentPageUsers = users.slice(startIndex, endIndex);

  return (
    <>
      <Head>
        <title>Тестовое задание</title>
        <meta name="description" content="Тестовое задание" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={inter.className}>
        <Container>
          <h1 className={"mb-5"}>Пользователи</h1>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Фамилия</th>
                <th>Телефон</th>
                <th>Email</th>
                <th>Дата обновления</th>
              </tr>
            </thead>
            <tbody>
              {currentPageUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstname}</td>
                  <td>{user.lastname}</td>
                  <td>{user.phone}</td>
                  <td>{user.email}</td>
                  <td>{user.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Pagination totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />

        </Container>
      </main>
    </>
  );
}
