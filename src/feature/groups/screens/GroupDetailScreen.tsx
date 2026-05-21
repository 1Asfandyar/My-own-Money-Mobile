import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';

import useGroupDetail from '@/feature/groups/hooks/useGroupDetail';
import GroupDetailView from '@/feature/groups/views/GroupDetailView';

const GroupDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ groupId?: string }>();
  const groupId = useMemo(() => {
    const parsedGroupId = Number(params.groupId);

    return Number.isFinite(parsedGroupId) && parsedGroupId > 0
      ? parsedGroupId
      : null;
  }, [params.groupId]);
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);
  const detail = useGroupDetail(groupId, handleBack);

  return <GroupDetailView detail={detail} />;
};

export default GroupDetailScreen;
