"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  useDocument,
  useCollection,
  Query,
  useDocumentUpdate,
  DatabaseDocument,
  useDocumentDelete,
  useDocumentCreate,
} from "../../../../dist";
import { FiTrash } from "react-icons/fi";

type Article = DatabaseDocument<{
  title: string;
  content: string;
  published: boolean;
}>;

function InfiniteQuery() {
  // const createDocument = useDocumentCreate<Article>();
  // const { data: article } = useDocument<Article>(
  //   "test",
  //   "articles",
  //   "643866c6f386c9c982c1"
  // );
  const data = useCollection<Article>("default", "dictionary", undefined, {
    addFirst: true,
    loadAll: true,
  });

  // const { data: publishedArticles } = useCollection<Article>(
  //   "default",
  //   "dictionary"
  // );

  // const { data: unpublishedArticles } = useCollection<Article>(
  //   "test",
  //   "articles",
  //   [Query.notEqual<Article>("published", true)]
  // );

  // console.log(publishedArticles);

  // useEffect(() => {
  //   if (article) {
  //     console.log("Document changed", article);
  //   }
  // }, [article]);

  useEffect(() => {
    console.log("Collection changed", data);
    console.log(data.flattenData);
  }, [data]);

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [published, setPublished] = useState<boolean>(true);

  return (
    <div className="flex items-center justify-center flex-1 gap-4">
      <div className="flex flex-col gap-4 md:flex-row ">
        <h1>Infinite Loading</h1>

        <div>
          <button
            onClick={() => data.fetchPreviousPage()}
            disabled={!data.hasPreviousPage || data.isFetchingPreviousPage}
          >
            {data.isFetchingPreviousPage
              ? "Loading more..."
              : data.hasPreviousPage
              ? "Load Older"
              : "Nothing more to load"}
          </button>
        </div>
        <p>{data.flattenData.documents?.length}</p>
        {/* {data.pages.map((page) => (
          <React.Fragment key={page.nextId}>
            {page.data.map((project) => (
              <p
                style={{
                  border: "1px solid gray",
                  borderRadius: "5px",
                  padding: "10rem 1rem",
                  background: `hsla(${project.id * 30}, 60%, 80%, 1)`,
                }}
                key={project.id}
              >
                {project.name}
              </p>
            ))}
          </React.Fragment>
        ))} */}
        <div>
          <button
            onClick={() => data.fetchNextPage()}
            disabled={!data.hasNextPage || data.isFetchingNextPage}
          >
            {data.isFetchingNextPage
              ? "Loading more..."
              : data.hasNextPage
              ? "Load Newer"
              : "Nothing more to load"}
          </button>
        </div>
        <div>
          {data.isFetching && !data.isFetchingNextPage
            ? "Background Updating..."
            : null}
        </div>
      </div>
      {/* <form
          className="flex flex-col gap-4 p-4 text-black bg-white rounded-sm"
          onSubmit={async (e) => {
            e.preventDefault();
            await createDocument.mutateAsync({
              databaseId: "test",
              collectionId: "articles",
              data: {
                title: title,
                content: content,
                published: published,
              },
            });
            setTitle("");
            setContent("");
            setPublished(true);
          }}
        >
          <span>Create Article</span>
          <input
            type="text"
            placeholder="Title"
            className="text-white"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          />
          <textarea
            placeholder="Content"
            className="text-white"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
            }}
          />
          <label className="flex flex-row items-center gap-2">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => {
                setPublished(e.target.checked);
              }}
            />
            Published
          </label>
          <button
            onClick={() => {}}
            className="w-full p-2 bg-blue-500 rounded-md"
          >
            Submit
          </button>
        </form>
        <div className="flex flex-col items-center justify-start gap-4">
          <h2 className="font-bold">Published Articles</h2>
          {publishedArticles?.documents?.map((article: Article) => (
            <ArticleListItem key={article.$id} {...article} />
          ))}
        </div>
        <div className="flex flex-col items-center justify-start gap-4">
          <h2 className="font-bold">Unpublished Articles</h2>
          {unpublishedArticles?.documents?.map((article: Article) => (
            <ArticleListItem key={article.$id} {...article} />
          ))}
        </div> */}
    </div>
    // </div>
  );
}

export default InfiniteQuery;
