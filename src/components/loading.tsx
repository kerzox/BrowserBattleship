export const Loading = () => {
  return (
    <svg
      width='36'
      height='36'
      fill='#fff'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
    >
      <style>{`
    .spinner_9y7u {
      animation: spinner_fUkk 2.4s linear infinite;
      animation-delay: -2.4s;
    }
    .spinner_DF2s {
      animation-delay: -1.6s;
    }
    .spinner_q27e {
      animation-delay: -0.8s;
    }
    @keyframes spinner_fUkk {
      8.33% {
        x: 12px;
        y: 1px;
      }
      25% {
        x: 12px;
        y: 1px;
      }
      33.3% {
        x: 12px;
        y: 12px;
      }
      50% {
        x: 12px;
        y: 12px;
      }
      58.33% {
        x: 1px;
        y: 12px;
      }
      75% {
        x: 1px;
        y: 12px;
      }
      83.33% {
        x: 1px;
        y: 1px;
      }
    }

    .cube {
      fill: #fff;
      stroke: #000;
      stroke-width: 0.5px;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `}</style>
      <rect
        className='cube spinner_9y7u'
        x='1'
        y='1'
        rx='1'
        width='10'
        height='10'
      />
      <rect
        className='cube spinner_9y7u spinner_DF2s'
        x='1'
        y='1'
        rx='1'
        width='10'
        height='10'
      />
      <rect
        className='cube spinner_9y7u spinner_q27e'
        x='1'
        y='1'
        rx='1'
        width='10'
        height='10'
      />
    </svg>
  );
};
