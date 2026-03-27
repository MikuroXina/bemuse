import AuthenticationPopup from '@bemuse/online/components/authentication-popup.js'
import {
  useCurrentUser,
  useLeaderboardQuery,
  usePersonalRankingEntryQuery,
} from '@bemuse/online/hooks'
import type { MappingMode } from '@bemuse/rules/mapping-mode'
import { type ReactNode, useState } from 'react'

import styles from './ranking.module.scss'
import RankingTable, { Message, Row } from './ranking-table.js'

const Error = ({
  text,
  error,
  retry,
}: {
  text: string
  error?: Error
  retry?: () => void
}) => (
  <span className={styles.error}>
    <strong>
      {text}{' '}
      <a onClick={retry} className={styles.errorRetry}>
        (click to retry)
      </a>
    </strong>
    <br />
    <span className={styles.errorDescription}>
      {error && error.message ? '' + error.message : '(unknown error)'}
    </span>
  </span>
)

const Leaderboard = ({
  chartMd5,
  playMode,
}: {
  chartMd5: string
  playMode: MappingMode
}) => {
  const { isLoading, isError, data, error, refetch } = useLeaderboardQuery(
    { md5: chartMd5 },
    playMode
  )

  let tableBody: ReactNode
  if (isLoading) {
    tableBody = <Message>Loading...</Message>
  } else if (isError) {
    tableBody = (
      <Message>
        <Error
          text='Sorry, we are unable to fetch the scoreboard.'
          error={error}
          retry={refetch}
        />
      </Message>
    )
  } else if (data?.data.length) {
    tableBody = data.data.map((record, index) => (
      <Row key={index} record={record} />
    ))
  } else {
    tableBody = <Message>No Data</Message>
  }
  return (
    <div className={styles.leaderboard} data-testid='ranking-leaderboard'>
      <div className={styles.title}>Leaderboard</div>
      <RankingTable>{tableBody}</RankingTable>
    </div>
  )
}

const Yours = ({
  chartMd5,
  playMode,
  onResubmitScoreRequest,
  showPopup,
}: {
  chartMd5: string
  playMode: MappingMode
  onResubmitScoreRequest?: () => void
  showPopup: () => void
}) => {
  const user = useCurrentUser()
  const { isLoading, isError, data, error } = usePersonalRankingEntryQuery(
    { md5: chartMd5 },
    playMode
  )

  let tableBody: ReactNode
  if (!user) {
    tableBody = (
      <Message>
        Please <a onClick={showPopup}>log in or create an account</a> to submit
        scores.
      </Message>
    )
  } else if (isError) {
    tableBody = (
      <Message>
        <Error
          text='Unable to submit score'
          error={error}
          retry={onResubmitScoreRequest}
        />
      </Message>
    )
  } else if (isLoading) {
    tableBody = <Message>Please wait...</Message>
  } else if (data) {
    tableBody = <Row record={data} />
  } else {
    tableBody = <Message>No record. Let’s play!</Message>
  }
  return (
    <div className={styles.yours} data-testid='ranking-yours'>
      <div className={styles.title}>Your Ranking</div>
      <RankingTable>{tableBody}</RankingTable>
    </div>
  )
}

export interface RankingProps {
  chartMd5: string
  playMode: MappingMode
  onResubmitScoreRequest?: () => void
}

const Ranking = ({
  chartMd5,
  playMode,
  onResubmitScoreRequest,
}: RankingProps) => {
  const [authenticationPopupVisible, setAuthenticationPopupVisible] =
    useState(false)

  const hidePopup = () => setAuthenticationPopupVisible(false)

  return (
    <div className={styles.container} data-testid='ranking'>
      <AuthenticationPopup
        visible={authenticationPopupVisible}
        onFinish={hidePopup}
        onBackdropClick={hidePopup}
      />
      <Yours
        chartMd5={chartMd5}
        playMode={playMode}
        onResubmitScoreRequest={onResubmitScoreRequest}
        showPopup={() => setAuthenticationPopupVisible(true)}
      />
      <Leaderboard chartMd5={chartMd5} playMode={playMode} />
    </div>
  )
}

export default Ranking
