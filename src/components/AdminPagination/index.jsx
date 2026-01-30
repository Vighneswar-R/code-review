import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

const red = '#E33439';
const grey = '#96989A';
const selected_red = '#F2D4D5';

const AdminPagination = ({ count, currentPage, handlePageChangeCb, inputClasses }) => {
  return (
    <div className={inputClasses}>
      <Stack spacing={2}>
        <Pagination
          page={currentPage}
          count={count}
          variant='outlined'
          shape='rounded'
          sx={{
            '& .MuiPagination-ul': {
              gap: '16px',
              justifyContent: 'center',
            },
            '& .MuiPagination-ul li button': {
              marginX: '0px',
              width: '40px',
              height: '40px',
              paddingY: '9px',
              paddingX: '12px',
              fontSize: '16px',
              lineHeight: '22px',
              fontWeight: '400',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'transparent',
              },
            },
            '& .MuiPagination-ul li button svg': {
              width: '28px',
              height: '28px',
            },
            '& .MuiPaginationItem-previousNext': {
              borderColor: grey,
            },
            '& .MuiPaginationItem-page, & .MuiPaginationItem-ellipsis': {
              color: grey,
              border: 'none',
            },
            '&:not(.Mui-disabled) .MuiPaginationItem-previousNext': {
              borderColor: red,
              color: red,
            },
            '& .MuiPaginationItem-page.Mui-selected': {
              backgroundColor: (theme) => selected_red,
              color: (theme) => red,
              border: 'none',
              boxShadow: '0px 4px 12px 0px rgba(205, 40, 47, 0.07)',
              '&:hover': {
                backgroundColor: selected_red,
              },
            },
            '& .Mui-disabled.MuiPaginationItem-previousNext': {
              borderColor: grey,
              color: grey,
            },
          }}
          onChange={handlePageChangeCb}
        />
      </Stack>
    </div>
  );
};

export default AdminPagination;
