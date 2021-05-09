import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  chakra,
  Box,
  IconButton,
} from "@chakra-ui/react";
import {
  RepeatClockIcon,
  RepeatIcon,
  TriangleDownIcon,
  TriangleUpIcon,
} from "@chakra-ui/icons";
import { useTable, useSortBy } from "react-table";
import { useMemo, useState, useEffect } from "react";
import axios from "axios";

export default function DataTable({ logAppId }) {
  const data = useMemo(
    () => [
      {
        timestamp: "2021-05-01T15:33:41.372922+00:00",
        deviceID: "CentOS server",
        severityLevel: 1,
        message: "Didn't receive stuff in time",
      },
      {
        timestamp: "2021-05-01T13:11:45.416313+00:00",
        deviceID: "123.123.123.123",
        severityLevel: 6,
        message: "Weird ssh ip",
      },
      {
        timestamp: "2021-05-01T16:03:08.172380+00:00",
        deviceID: "RaspberryPI",
        severityLevel: 7,
        message: "Kernel panic",
      },
      {
        timestamp: "2021-05-01T18:03:04.175680+00:00",
        deviceID: "Samsung galaxy S20",
        severityLevel: 1,
        message: `Sed ut perspiciatis unde 
          omnis iste natus error sit voluptatem accusantium 
          doloremque laudantium, totam rem aperiam, eaque ipsa q
          uae ab illo inventore veritatis et quasi architecto beatae 
          vitae dicta sunt explicabo. `,
      },
    ],
    []
  );

  const columns = useMemo(
    () => [
      {
        Header: "Timestamp",
        accessor: "timestamp",
      },
      {
        Header: "Device ID",
        accessor: "deviceID",
      },
      {
        Header: "Severity level",
        accessor: "severityLevel",
      },
      {
        Header: "Message",
        accessor: "message",
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data }, useSortBy);

  return (
    <Box>
      <IconButton
        colorScheme="teal"
        aria-label="Call Segun"
        size="lg"
        icon={<RepeatIcon />}
      />
      <Table {...getTableProps()}>
        <Thead>
          {headerGroups.map((headerGroup) => (
            <Tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <Th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render("Header")}
                  <chakra.span pl="4">
                    {column.isSorted ? (
                      column.isSortedDesc ? (
                        <TriangleDownIcon aria-label="sorted descending" />
                      ) : (
                        <TriangleUpIcon aria-label="sorted ascending" />
                      )
                    ) : null}
                  </chakra.span>
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <Tr {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <Td {...cell.getCellProps()} overflowWrap={"break-word"}>
                    {cell.render("Cell")}
                  </Td>
                ))}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
}
