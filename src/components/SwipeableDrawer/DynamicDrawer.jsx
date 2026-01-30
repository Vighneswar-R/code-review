import { styled } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import BottomSheetHandle from '../BottomSheetHandle';

const drawerBleeding = 0;

const Root = styled('div')(({ theme }) => ({
  height: '100%',
  backgroundColor: theme.palette.mode === 'light' ? grey[100] : theme.palette.background.default,
}));

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#fff' : grey[800],
}));

export default function DynamicDrawer({
  open = false,
  setOpen,
  height,
  children,
  drawerChildrenClasses,
  optionalSheetHandlerClasses,
}) {
  const toggleDrawer = () => {
    setOpen((prev) => !prev);
  };

  return (
    <Root>
      <SwipeableDrawer
      style={{zIndex:999999}}
        anchor='bottom'
        open={open}
        swipeAreaWidth={drawerBleeding}
        allowSwipeInChildren={false}
        disableSwipeToOpen={false}
        disableBackdropTransition
        ModalProps={{
          keepMounted: true,
        }}
      >
        <StyledBox
          sx={{
            position: 'relative',
            marginTop: `${-drawerBleeding}px`,
            visibility: 'visible',
            right: 0,
            left: 0,
          }}
          className='rounded-t-2xl'
        >
          <div className={`pt-2 flex justify-center flex-col ${optionalSheetHandlerClasses}`}>
            <BottomSheetHandle />
          </div>
        </StyledBox>

        <div
          style={{ height: height }}
          className={`flex flex-col items-center p-5 w-[100vw] overflow-hidden ${drawerChildrenClasses}`}
        >
          {children}
        </div>
      </SwipeableDrawer>
    </Root>
  );
}
