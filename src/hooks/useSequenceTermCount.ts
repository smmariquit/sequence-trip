// src/hooks/useSequenceTermCount.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import type { OEISSequence } from "../sequences/types";
import { fetchMoreTerms } from "../oeis/bfile";
import {
  buildDisplaySequence,
  initialTermCount,
  maxTermCount,
  nextTermCount,
} from "../sequences/termCount";

export function useSequenceTermCount(
  sequence: OEISSequence | null,
  setSequence: React.Dispatch<React.SetStateAction<OEISSequence | null>>
) {
  const [termCount, setTermCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [bfileUnavailable, setBfileUnavailable] = useState(false);

  useEffect(() => {
    if (!sequence) {
      setTermCount(0);
      setBfileUnavailable(false);
      return;
    }
    setBfileUnavailable(false);
    setTermCount(initialTermCount(sequence));
  }, [sequence?.anum, sequence?.vizType]);

  const maxCount = sequence ? maxTermCount(sequence, bfileUnavailable) : 0;
  const canLoadMore = !!sequence && termCount < maxCount;

  const loadMore = useCallback(async () => {
    if (!sequence || loadingMore || !canLoadMore) return;

    const target = nextTermCount(termCount, maxCount);

    if (sequence.vizType) {
      setTermCount(target);
      return;
    }

    const have = sequence.terms?.length ?? 0;
    if (target <= have) {
      setTermCount(target);
      return;
    }

    setLoadingMore(true);
    try {
      const more = await fetchMoreTerms(sequence.anum);
      if (more && more.length > have) {
        setSequence((prev) =>
          prev?.anum === sequence.anum ? { ...prev, terms: more } : prev
        );
        setTermCount(Math.min(target, more.length));
      } else {
        setBfileUnavailable(true);
        setTermCount(have);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [sequence, loadingMore, canLoadMore, termCount, maxCount, setSequence]);

  const displaySequence = useMemo(
    () => (sequence ? buildDisplaySequence(sequence, termCount) : null),
    [sequence, termCount]
  );

  return {
    termCount,
    displaySequence,
    loadMore,
    loadingMore,
    canLoadMore,
  };
}
