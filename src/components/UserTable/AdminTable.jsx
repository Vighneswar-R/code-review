const AdminTable = ({ TableHeaderList, children }) => {
  return (
    <div className='custom-table overflow-x-scroll'>
      {/* Table height h-[570px] */}
      <table className='w-full table-fixed'>
        <thead>
          <tr>
            {TableHeaderList.map(({ heading, width }) => (
              <th
                className={`
                  text-dark-grey font-medium text-xs leading-5 lg:p-4 bg-white text-left`}
                key={heading}
                style={{
                  width: width && `${width}px`,
                }}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>{children}</tbody>
      </table>
    </div>
  );
};
export default AdminTable;
