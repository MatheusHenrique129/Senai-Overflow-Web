import styled, { keyframes } from "styled-components";

const spin = keyframes`
    100%{
        transform: rotate(360deg);
        transform: scale(15px);
    }
`;

export const Container = styled.div`
  z-index: 99;
  width: 100vw;
  height: 100vh;
  display: flex;
  position: absolute;
  align-items: center;
  flex-direction: column;
  background-color: #333c;
  justify-content: center;

  > img {
    opacity: 0.8;
    width: 100px;
    height: 100px;
    user-select: none;
    border-radius: 50%;
    margin-bottom: 10px;
    animation: ${spin} 2s linear infinite;
  }
`;
