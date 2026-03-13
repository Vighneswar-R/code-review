import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import AdminHeader from '../../../../components/Header/AdminHeader.jsx';
import AdminPagination from '../../../../components/AdminPagination/index.jsx';
import AdminTable from '../../../../components/UserTable/AdminTable.jsx';
import Row from '../../../../components/UserRow/AdminHistoryRow.jsx';
import { DropDown } from '../../../../components/index.jsx';
import { filterDateOptions, filterOptions } from '../../../../utils/index.js';
import { parseISO } from 'date-fns';
import moment from 'moment';
import AdminDateRangePicker from '../../../../components/AdminDateRangePicker/index.jsx';
import { getLogs } from '../../../../global/index.js';
import { AuthContext } from '../../../../context/AuthContextProvider.jsx';
import NoUsersOnSearchIcon from '../../../../assets/icons/NoUsersOnSearch.jsx';
import AdminToastMessage from '../../../../components/ToastMessage/AdminToast.jsx';

// table heading names
const TableHeaderList = [
  {
    heading: 'ADMIN EMP CODE',
    width: 140,
  },
  {
    heading: 'ADMIN NAME',
    width: 230,
  },
  {
    heading: 'USER EMP CODE',
    width: 140,
  },
  {
    heading: 'USER NAME',
    width: 230,
  },
  {
    heading: 'MODIFIED DATE',
    width: 125,
  },
  {
    heading: 'STATUS',
    width: 130,
  },
  {
    heading: 'NEW DATA',
    width: 200,
  },
  {
    heading: 'OLD DATA',
    width: 200,
  },
  {
    heading: 'IP ADDRESS',
    width: 200,
  },
];

const History = () => {
  const { token, userToastMessage, setUserToastMessage, setToastType, toastType } =
    useContext(AuthContext);
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState('');
  // const [emptyState, setEmptyState] = useState(false);

  const [fetchedList, setFetchedList] = useState([]);
  const [search, setSearch] = useState(false);
  const [listToDisplay, setListToDisplay] = useState([]);
  const [currentDisplayedList, setCurrentDisplayedList] = useState([]);

  const [dateState, setDateState] = useState(filterDateOptions[0].value);

  const [open, setOpen] = useState(false);
  const [range, setRange] = useState(false);

  const PAGE_SIZE = 100;
  const ITEMS_PER_PAGE = 10;

  const [selectionRange, setSelectionRange] = useState({
    startDate: parseISO(moment().subtract(30, 'days').format('YYYY-MM-DD')),
    endDate: parseISO(moment().add(1, 'day').format('YYYY-MM-DD')),
    key: 'selection',
  });

  const [refresh, setRefresh] = useState(null);

  const searchAbortRef = useRef(null);

  // Abort in-flight search on unmount
  useEffect(() => {
    return () => {
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
    };
  }, []);

  // fetch new logs when date filter value changes
  useEffect(() => {

    let isMounted = true; 

    if (dateState === 'Range') {
      setOpen(true);
      setRange(true);
      return;
    } else {
      let params;
      switch (dateState) {
        case 'Last 30 days': {
          params = {
            from_date: moment().subtract(30, 'days').format('YYYY-MM-DD'),
            to_date: moment().add(1, 'day').format('YYYY-MM-DD'),
            page: 1,
            page_size: PAGE_SIZE,
          };
          break;
        }
        case 'Today': {
          params = {
            from_date: moment().format('YYYY-MM-DD'),
            to_date: moment().add(1, 'days').format('YYYY-MM-DD'),
            page: 1,
            page_size: PAGE_SIZE,
          };
          break;
        }
        case 'Yesterday': {
          params = {
            from_date: moment().subtract(1, 'days').format('YYYY-MM-DD'),
            to_date: moment().format('YYYY-MM-DD'),
            page: 1,
            page_size: PAGE_SIZE,
          };
          break;
        }
        case 'Last 7 days': {
          params = {
            from_date: moment().subtract(7, 'days').format('YYYY-MM-DD'),
            to_date: moment().add(1, 'day').format('YYYY-MM-DD'),
            page: 1,
            page_size: PAGE_SIZE,
          };
          break;
        }
        default:
          break;
      }
      const paramString = Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

      getLogs(paramString, {
        headers: {
          Authorization: token,
        },
      })
        .then((logs) => {
            if (isMounted) {  
          setFetchedList(logs);
          setListToDisplay(logs);
            }
        })
        .catch((error) => {
            if (isMounted) {  
              console.log('error in fetching logs', error);
            } 
            console.log('GET_LOGS_ERROR', error);

        });
    }

      return () => {
    isMounted = false;   // cleanup when component unmounts
  };
  }, [dateState]);

  // fetch logs based on date range
  useEffect(() => {
    if (range) {
      const params = {
        from_date: moment(selectionRange.startDate).format('YYYY-MM-DD'),
        to_date: moment(selectionRange.endDate).add(1, 'day').format('YYYY-MM-DD'),
        page: 1,
        page_size: PAGE_SIZE,
      };

      const paramString = Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

      getLogs(paramString, {
        headers: {
          Authorization: token,
        },
      })
        .then((logs) => {
          setFetchedList(logs);
          setListToDisplay(logs);
        })
        .catch((error) => {
          console.log('GET_LOGS_ERROR', error);
        });
    }
  }, [selectionRange]);

  useEffect(() => {
    if (!refresh) return;

    let isMounted = true;
    const controller = new AbortController();

    let params;
    switch (dateState) {
      case 'Last 30 days': {
        params = {
          from_date: moment().subtract(30, 'days').format('YYYY-MM-DD'),
          to_date: moment().add(1, 'day').format('YYYY-MM-DD'),
          page: 1,
          page_size: PAGE_SIZE,
        };
        break;
      }
      case 'Today': {
        params = {
          from_date: moment().format('YYYY-MM-DD'),
          to_date: moment().add(1, 'days').format('YYYY-MM-DD'),
          page: 1,
          page_size: PAGE_SIZE,
        };
        break;
      }
      case 'Yesterday': {
        params = {
          from_date: moment().subtract(1, 'days').format('YYYY-MM-DD'),
          to_date: moment().format('YYYY-MM-DD'),
          page: 1,
          page_size: PAGE_SIZE,
        };
        break;
      }
      case 'Last 7 days': {
        params = {
          from_date: moment().subtract(7, 'days').format('YYYY-MM-DD'),
          to_date: moment().add(1, 'day').format('YYYY-MM-DD'),
          page: 1,
          page_size: PAGE_SIZE,
        };
        break;
      }
      case 'Range': {
        params = {
          from_date: moment(selectionRange.startDate).format('YYYY-MM-DD'),
          to_date: moment(selectionRange.endDate).add(1, 'day').format('YYYY-MM-DD'),
          page: 1,
          page_size: PAGE_SIZE,
        };
        break;
      }
      default:
        return;
    }
    const paramString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    getLogs(paramString, {
      headers: {
        Authorization: token,
      },
      signal: controller.signal,
    })
      .then((logs) => {
        if (!isMounted) return;
        setFetchedList(logs);
        setListToDisplay(logs);
      })
      .catch((error) => {
        if (!isMounted) return;
        if (error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') return;
        console.log('GET_LOGS_ERROR', error);
      });

    return () => {
      isMounted = false;
      controller.abort();   // on Unmouting 
    };
  }, [refresh]);

  //date filter
  const handleDateChange = useCallback(
    (value) => {
      setDateState(value);
    },
    [listToDisplay],
  );

  //active Inactive filter
  const handleUsersChange = useCallback(
    (value) => {
      switch (value) {
        case 'All users': {
          return setListToDisplay(fetchedList);
        }
        case 'active': {
          return setListToDisplay(
            fetchedList.filter((log) => {
              if (log?.dump?.new_object?.status) {
                return log?.dump?.new_object?.status === value;
              } else if (log?.dump?.new_object === null && log?.endpoint == '/add-user/') {
                return true;
              } else if (
                log?.dump?.new_object === null &&
                log?.endpoint.includes('/delete-user/')
              ) {
                return log?.dump?.old_object?.status === value;
              }
              return false;
            }),
          );
        }
        case 'inActive': {
          return setListToDisplay(
            fetchedList.filter((log) => {
              if (log?.dump?.new_object?.status) {
                return log?.dump?.new_object?.status === value;
              } else if (
                log?.dump?.new_object === null &&
                log?.endpoint.includes('/delete-user/')
              ) {
                return log?.dump?.old_object?.status === value;
              }
              return false;
            }),
          );
        }
        default:
          return setListToDisplay(fetchedList);
      }
    },
    [listToDisplay],
  );

  // after fetching logs, set initial 10 logs for pagination
  useEffect(() => {
    setCurrentPage(1);
    setCount(Math.ceil(listToDisplay.length / 10));
    setCurrentDisplayedList(
      // listToDisplay.filter((_, i) => {
      //   return i < 10;
      listToDisplay.slice(0, 10),
    );
  }, [listToDisplay]);

  // search for logs against LO
  const handleSearch = async (e) => {
    e.preventDefault();

    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }
    searchAbortRef.current = new AbortController();

    const params = {
      search: query,
      page: 1,
      page_size: PAGE_SIZE,
    };
    // const paramString = Object.entries(params)
    //   .map(([key, value]) => `${key}=${value}`)
    //   .join('&');

    const paramString = Object.entries(params)
  .map(([key, value]) =>
    `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
  )
  .join('&');

    try {
      const searchedResults = await getLogs(paramString, {
        headers: {
          Authorization: token,
        },
        signal: searchAbortRef.current.signal,
      });
      setSearch(true);
      setListToDisplay(searchedResults);
    } catch (error) {
      if (error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') return;
      console.log('GET_LOGS_ERROR', error);
    }
  };

  const handleResetSearch = (e) => {
    setQuery('');
    setSearch(false);
    setListToDisplay(fetchedList);
  };

  // pagination filter
  const handleChange = (event, value) => {

    const totalPages = Math.ceil(listToDisplay.length / ITEMS_PER_PAGE);
     // Bounds checking
  if (value < 1 || value > totalPages) {
    return;
  }


    setCurrentPage(value);
    // Assuming each page contains a fixed number of items, let's say 10 items per page
    // const itemsPerPage = 10;

    // Calculate the start and end count based on the current page
    const startCount = (value - 1) * ITEMS_PER_PAGE;
    // const endCount = value * ITEMS_PER_PAGE - 1;
    setCurrentDisplayedList(
      // listToDisplay.filter((log, i) => {
      //   return i >= startCount && i <= endCount;
      // }),
      listToDisplay.slice(startCount, startCount + ITEMS_PER_PAGE),
    );
  };

  const handleLogsRefresh = () => {
    setQuery('');
    setSearch(false);
    setRefresh(Math.random());
    setToastType('success');
    setUserToastMessage(`Data refreshed successfully!`);
  };

  return (
    <>
      <AdminToastMessage
        message={userToastMessage}
        setMessage={setUserToastMessage}
        state={toastType}
      />

      <AdminHeader
        title='History'
        query={query}
        setQuery={setQuery}
        handleSearch={handleSearch}
        handleResetSearch={handleResetSearch}
        showSearch={true}
        showButton={false}
        showRefresh={true}
        callback={handleLogsRefresh}
        prompt='Search for emp code, role, branch, mob number'
        backRoute='/admin'
      />

      {open ? (
        <div className='fixed inset-0 w-full bg-black bg-opacity-50' style={{ zIndex: 99 }}>
          <AdminDateRangePicker
            selectionRange={selectionRange}
            setSelectionRange={setSelectionRange}
            open={open}
            setOpen={setOpen}
          />
        </div>
      ) : null}

      <>
        <div className={`px-6 py-4 bg-medium-grey grow overflow-y-auto overflow-x-hidden`}>
          {!search && (
            <div className='flex justify-between w-full mb-4 items-center'>
              <div className='gap-4 flex'>
                <DropDown
                  label='USERS'
                  options={filterOptions}
                  onChange={handleUsersChange}
                  defaultSelected={filterOptions[0].value}
                  resetDefaultSelected={dateState}
                  inputClasses='w-[170px] h-14'
                  labelClassName='text-xs font-medium !text-dark-grey'
                  styles='h-8 items-center text-xs px-3 py-2 rounded-[4px]'
                />

                <DropDown
                  label='DATE'
                  options={filterDateOptions}
                  onChange={handleDateChange}
                  defaultSelected={dateState}
                  inputClasses='w-[170px] h-14'
                  labelClassName='text-xs font-medium !text-dark-grey'
                  styles='h-8 items-center text-xs px-3 py-2 rounded-[4px]'
                  optionsMaxHeight='220'
                />
              </div>
            </div>
          )}

          {listToDisplay.length ? (
            <>
              <AdminTable TableHeaderList={TableHeaderList}>
                {currentDisplayedList.map((log, i) => (
                  <Row log={log} key={log.id} i={i} />
                ))}
              </AdminTable>

              <AdminPagination
                count={count}
                currentPage={currentPage}
                handlePageChangeCb={handleChange}
                inputClasses=' flex justify-end mt-3'
              />
            </>
          ) : (
            <div className='flex justify-center items-center h-full'>
              <NoUsersOnSearchIcon />
            </div>
          )}
        </div>
      </>
    </>
  );
};

export default History;
