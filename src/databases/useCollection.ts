"use client";

import {
  type InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { Models } from "appwrite";
import { useEffect, useMemo } from "react";
import { Query, useAppwrite } from "../index";
import type {
  DatabaseDocumentOperation,
  DatabaseDocument,
  DatabaseCollection,
} from "./types";

/**
 * Fetches a collection from a database.
 * @param databaseId The database the collection belongs to.
 * @param collectionId The collection to fetch.
 * @param queries Queries to filter the collection by.
 * @param options Options to configure query.
 * @param queryOptions Options to pass to `react-query`.
 * @link [Appwrite Documentation](https://appwrite.io/docs/client/databases?sdk=web-default#databasesListDocuments)
 */
export function useCollection<TDocument>(
  databaseId: string,
  collectionId: string,
  queries: string[] = [],
  options = {
    // loadAll: false,
    // addFirst: false,
    realtime: true,
  },
  queryOptions?: UseInfiniteQueryOptions<
    Models.DocumentList<DatabaseDocument<TDocument>>,
    unknown
  >
) {
  const { databases } = useAppwrite();
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => ["appwrite", "databases", databaseId, collectionId, { queries }],
    [databaseId, collectionId, queries]
  );
  const queryResult = useInfiniteQuery({
    queryKey,
    queryFn: async (param) => {
      // console.log("param", param);
      if (!param.pageParam)
        return await databases.listDocuments<DatabaseDocument<TDocument>>(
          databaseId,
          collectionId,
          queries
        );
      else {
        return await databases.listDocuments<DatabaseDocument<TDocument>>(
          databaseId,
          collectionId,
          [
            ...queries,
            param.pageParam.type == "getNextPage"
              ? Query.cursorAfter(param.pageParam.cursor)
              : Query.cursorBefore(param.pageParam.cursor),
          ]
        );
      }
    },

    getNextPageParam: (lastPage, allPages) =>
      lastPage.documents.length == 0
        ? undefined
        : {
            cursor: lastPage.documents[lastPage.documents.length - 1].$id,
            type: "getNextPage",
          },

    getPreviousPageParam: (firstPage, allPages) =>
      firstPage.documents.length == 0
        ? undefined
        : { cursor: firstPage.documents[0].$id, type: "getPreviousPage" },

    onSuccess: (collection) => {
      for (const document of collection.pages[collection.pages.length - 1]
        .documents) {
        queryClient.setQueryData(
          [
            "appwrite",
            "databases",
            databaseId,
            collectionId,
            "documents",
            document.$id,
          ],
          document
        );
      }
    },
    ...queryOptions,
  });
  // console.log(options);
  useEffect(() => {
    if (options.realtime) {
      const unsubscribe = databases.client.subscribe(
        `databases.${databaseId}.collections.${collectionId}.documents`,
        (response) => {
          const [, operation] = response.events[0].match(
            /\.(\w+)$/
          ) as RegExpMatchArray;
          const document = response.payload as DatabaseDocument<TDocument>;

          const validate = queries.reduce((acc, data) => {
            const split = data.split('"');
            if (split[0].includes("equal")) {
              const condition = split[1];
              const value = split[3];

              return acc && document?.[condition] == value;
            }
            return acc;
          }, true);
          if (validate) {
            switch (operation as DatabaseDocumentOperation) {
              // case "create":
              // case "update":
              // case "delete":
              //   queryClient.setQueryData(
              //     [
              //       "appwrite",
              //       "databases",
              //       databaseId,
              //       collectionId,
              //       "documents",
              //       document.$id,
              //     ],
              //     document
              //   );

              // // This is not optimal, but is needed until this is implemented.
              // // https://github.com/appwrite/appwrite/issues/2490
              // queryClient.invalidateQueries({
              //   queryKey,
              //   exact: true,
              // });

              // break;
              case "create":
                queryClient.setQueryData(
                  [
                    "appwrite",
                    "databases",
                    databaseId,
                    collectionId,
                    "documents",
                    document.$id,
                  ],
                  document
                );
                queryClient.setQueryData<
                  InfiniteData<
                    Array<Models.DocumentList<DatabaseDocument<TDocument>>>
                  >
                  /* @ts-ignore */
                >(queryKey, (oldData) => {
                  if (!oldData) return oldData;
                  const newData =
                    oldData.pages[0][0].documents.unshift(document);

                  return {
                    ...oldData,
                    pages: newData,
                  };
                });
                break;

              case "update":
                queryClient.setQueryData(
                  [
                    "appwrite",
                    "databases",
                    databaseId,
                    collectionId,
                    "documents",
                    document.$id,
                  ],
                  document
                );
                queryClient.setQueryData<
                  InfiniteData<
                    Array<Models.DocumentList<DatabaseDocument<TDocument>>>
                  >
                  /* @ts-ignore */
                >(queryKey, (oldData) => {
                  if (!oldData) return oldData;
                  const newData = oldData.pages.map((page) =>
                    page.map((collection) => {
                      if (collection?.documents) {
                        return collection.documents.map((storedDocument) => {
                          if (storedDocument.$id !== document.$id) {
                            return document;
                          } else {
                            return storedDocument;
                          }
                        });
                      }

                      return collection;
                    })
                  );

                  return {
                    ...oldData,
                    pages: newData,
                  };
                });
                break;

              case "delete":
                queryClient.setQueryData<
                  InfiniteData<
                    Array<Models.DocumentList<DatabaseDocument<TDocument>>>
                  >
                  /* @ts-ignore */
                >(queryKey, (oldData) => {
                  if (!oldData) return oldData;
                  const newData = oldData.pages.map((page) =>
                    page.map((collection) => {
                      if (collection?.documents) {
                        return collection.documents.filter(
                          (storedDocument) =>
                            storedDocument.$id !== document.$id
                        );
                      }

                      return collection;
                    })
                  );

                  return {
                    ...oldData,
                    pages: newData,
                  };
                });

                break;
            }
          }
        }
      );

      return unsubscribe;
    }
    return;
  }, [databaseId, collectionId, queryKey, options, queries]);

  const flattenData = useMemo(() => {
    return {
      documents: queryResult?.data?.pages.flatMap((page) => page.documents),
      total: queryResult?.data?.pages[0].total,
    };
  }, [queryResult.data]);

  return { ...queryResult, flattenData };
}
